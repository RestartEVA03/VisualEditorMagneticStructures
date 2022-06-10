$('#file-spins').on('input keyup upload-pos', function() {
    var label = $('[for="file-spins"]');
    fileInfo(label);
});

$('#refresh').on('click', function() {
    label = $('.is-ready');
    label.addClass('is-active');
    setTimeout(function() {
        label.removeClass('is-active');
        label.removeClass('is-ready');
    },520);
    $('.dragover').removeClass('dragover');
});

$('.checked').on('click', function() {
    $('.checked.is-active').removeClass('is-active');
    $(this).addClass('is-active');
});

$('.check-refresh').on('click', function() {
    $('.checked.is-active').removeClass('is-active');
});

function fileInfo(label) {
    label.addClass('is-active');
    label.addClass('is-ready');

    setTimeout(function() {
        label.removeClass('is-active');
    },520);
}
