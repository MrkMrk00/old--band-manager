import { CreateTableBuilder, sql } from 'kysely';

export const timestamps = (builder: CreateTableBuilder<any>) => {
    return builder.addColumn('created_at', 'timestamp', c => c.defaultTo(sql`CURRENT_TIMESTAMP`))
        .addColumn('updated_at', 'timestamp', c => c.modifyEnd(sql`DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`));
};