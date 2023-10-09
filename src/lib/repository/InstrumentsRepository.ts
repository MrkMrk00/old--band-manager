import type { InsertResult, Kysely, Updateable } from 'kysely';
import { UpdateResult, sql } from 'kysely';
import { Database } from '@/database';
import { Repository } from '@/lib/entity-utils/Repository';
import { InstrumentsValidator } from '@/lib/entity-utils/validators';
import Logger from '@/lib/logger';
import t, { TranslateOpt } from '@/i18n/translator';
import type { InstrumentDatabase } from '@/model/instruments';

function tEntity(key: string, ...opts: (TranslateOpt | undefined)[]) {
    return t('cs', 'entity', key, 'ucfirst', ...opts);
}

export type UpsertableInstrument = Updateable<InstrumentDatabase> & {
    groupings?: number[];
};

export default class InstrumentsRepository extends Repository<'instruments'> {
    #logger: Logger;

    constructor(database: Kysely<Database>, logger: Logger) {
        super(database, 'instruments');
        this.#logger = logger;
    }

    updateOne(instrumentId: number, instrument: Omit<Updateable<InstrumentDatabase>, 'id'>) {
        return this.update()
            .set(instrument)
            .where('instruments.id', '=', instrumentId)
            .executeTakeFirstOrThrow();
    }

    async upsert({ id, groupings, ...instrument }: UpsertableInstrument) {
        let result: InsertResult | UpdateResult;
        if (!id) {
            const checkedInstrument = InstrumentsValidator.checkInsertable.safeParse(instrument);

            if (!checkedInstrument.success) {
                return Promise.resolve(checkedInstrument.error);
            }

            result = await this.insert().values(checkedInstrument.data).executeTakeFirst();
            id = Number(result.insertId);
        } else {
            result = await this.updateOne(id, instrument);
        }

        if (groupings) {
            const groupingsResult = await this.#handleGroupingRelations(id, groupings);
            if (!groupingsResult.success) {
                this.#logger.error('InstrumentsRepository.upsert :: Groupings upsert failed', {
                    message: groupingsResult.error,
                    groupingsResult,
                    groupings,
                    instrument,
                });
            }
        }

        return result;
    }

    async #handleGroupingRelations(
        instrumentId: number,
        groupings: number[],
        checkGroupingsExist: boolean = true,
    ): Promise<
        | {
              success: false;
              error: string;
          }
        | { success: true }
    > {
        if (checkGroupingsExist) {
            const existing = (
                await this.database
                    .selectFrom('instrument_groupings')
                    .select('id')
                    .where('id', 'in', groupings)
                    .execute()
            ).map(groupingObject => groupingObject.id);

            const diff = groupings.filter(id => !existing.includes(id));
            if (diff.length > 0) {
                return {
                    success: false,
                    error: tEntity(
                        'entityWithDoesNotExist',
                        tEntity('instrument_grouping'),
                        `id=[${diff.join(', ')}]`,
                    ),
                };
            }
        }

        let alreadyHas: number[];
        if (instrumentId) {
            alreadyHas = (
                await this.database
                    .selectFrom('instruments_groupings_relations')
                    .select('id_grouping')
                    .where('id_instrument', '=', instrumentId)
                    .execute()
            ).map(result => result.id_grouping);
        } else {
            alreadyHas = [];
        }

        // delete those that are in database but not in the groupings argument
        const removeIds = alreadyHas.filter(id => !groupings.includes(id));

        if (removeIds.length > 0) {
            await this.database
                .deleteFrom('instruments_groupings_relations')
                .where('id_instrument', '=', instrumentId)
                .where('id_grouping', 'in', removeIds)
                .executeTakeFirstOrThrow();
        }

        // does not have yet, but are supplied in groupings argument
        const insertIds = groupings.filter(id => !alreadyHas.includes(id));

        if (insertIds.length > 0) {
            await this.database
                .insertInto('instruments_groupings_relations')
                .values(
                    insertIds.map(id => ({
                        id_instrument: instrumentId,
                        id_grouping: id,
                    })),
                )
                .execute();
        }

        return { success: true };
    }

    getRelatedGroupings(instrumentId: number | number[]) {
        let qb = this.database
            .selectFrom('instruments_groupings_relations as igr')
            .innerJoin('instrument_groupings as ig', 'ig.id', 'igr.id_grouping')
            .selectAll('ig')
            .select('igr.id_instrument');

        if (typeof instrumentId === 'number') {
            qb = qb.where('igr.id_instrument', '=', instrumentId);
        } else if (instrumentId.length < 1) {
            qb = qb.where(sql`(1 = 0)`);
        } else {
            qb = qb.where('igr.id_instrument', 'in', instrumentId);
        }

        return qb;
    }
}
