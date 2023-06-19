document.addEventListener('readystatechange', function () {
    if (document.readyState !== 'complete') { return; }

    const icons = document.querySelectorAll('.fa-icon');
    for (const icon of icons) {
        icon.insertAdjacentHTML(
            'afterbegin',
            '<!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->',
        );
    }
});
