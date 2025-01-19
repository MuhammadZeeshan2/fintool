$(document).ready(function() {
    $('#diseases').select2({
        ajax: {
            url: '/get_diseases',
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return {
                    q: params.term,
                    page: params.page
                };
            },
            processResults: function (data, params) {
                params.page = params.page || 1;

                return {
                    results: data.items,
                    pagination: {
                        more: (params.page * 20) < data.total_count
                    }
                };
            },
            cache: true
        },
        placeholder: 'Search for disease',
        minimumInputLength: 1,
    });
});