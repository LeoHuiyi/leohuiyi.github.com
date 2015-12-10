console.log(leoDom.version);

// console.log(leoDom.$css('div', "background-color"), leoDom.$css('div', ["background-color", 'width']))
// console.log($('div').css("background-color"), leoDom.$css('div', ["background-color", 'width']));
// leoDom.$css('div', 'width', 200);
// leoDom.$css('div', {'width': 200, 'height': 100});
// leoDom.$css('div', 'width', function(elem, i, val){
//     console.log(elem, i, val);
//     return i * '50';
// });
// $('div').css('width', function(i, val){
//     console.log(this, i, val);
//     return i * '50';
// });

// leoDom.$on('span', 'leo', function(event){
//     event.preventDefault();
//     console.log(this, event);
// });
// leoDom.$on('a', 'click', function(event){
//     event.preventDefault();
//     console.log(this, event);
// });
leoDom.$data('a', 'leo', 'hahah');
leoDom.$on(document, 'click', 'a', function(event) {
    event.preventDefault();
    console.log(this, event, leoDom.$data(event.target, 'leo'));
    leoDom.$transition('#mBox', {
        x: 50
    });
    leoDom.$transition('#mBox', {
        x: 0
    });
    leoDom.$transition('#mBox', {
        y: 50
    });
    leoDom.$transition('#mBox', {
        y: 0
    });
});
// $('span').on('leo', function(event) {
//     event.preventDefault();
//     console.log(this, event);
// });

// leoDom.$trigger('span', 'leo');
// leoDom.$triggerHandler('span', 'leo');
// $('span').triggerHandler('leo');

// console.log(leoDom.$width(window), leoDom.$width(document));
// console.log($(window).width(), $(document).width());
// console.log(leoDom.$height(window), leoDom.$height(document));
// console.log($(window).height(), $(document).height());

// console.log(leoDom.$width('#box'));
// console.log($('#box').width());
// leoDom.$width('#box', '100rem');
// leoDom.$width('#box', '+100');
// $('#box').width('100rem');
// $('#box').width('+100');
// leoDom.$width('#box', function(elem, i, val){
//     console.log(elem, i, val);
//     return '100rem';
// });
// $('#box').width(function(i, val){
//     console.log(this, i, val);
//     return '100rem';
// })

// console.log(leoDom.$height('#box'));
// console.log($('#box').height());
// leoDom.$height('#box', '100rem');
// console.log(leoDom.$height('#box'));
// console.log($('#box').height());
// leoDom.$height('#box', '+100');
// $('#box').height('100rem');
// $('#box').height('+100');
// leoDom.$height('#box', function(elem, i, val){
//     console.log(elem, i, val);
//     return '100rem';
// });
// $('#box').height(function(i, val){
//     console.log(this, i, val);
//     return '100rem';
// })

// console.log(leoDom.$innerWidth('#box'));
// console.log($('#box').innerWidth());
// leoDom.$innerWidth('#box', '100rem');
// console.log(leoDom.$innerWidth('#box'));
// console.log($('#box').innerWidth());
// leoDom.$innerWidth('#box', '+=200');
// $('#box').innerWidth('+=200');
// console.log(leoDom.$innerWidth('#box'));
// console.log($('#box').innerWidth());
// leoDom.$innerWidth('#box', function(elem, i, val){
//     console.log(elem, i, val);
//     return '100rem';
// });
// $('#box').innerWidth(function(i, val){
//     console.log(this, i, val);
//     return '100rem';
// });

// console.log(leoDom.$outerWidth('#box'));
// console.log($('#box').outerWidth());
// leoDom.$outerWidth('#box', '100rem');
// console.log(leoDom.$outerWidth('#box'));
// console.log($('#box').outerWidth());
// leoDom.$outerWidth('#box', '+=200');
// $('#box').outerWidth('+=200');
// console.log(leoDom.$outerWidth('#box'));
// console.log($('#box').outerWidth());
// leoDom.$outerWidth('#box', function(elem, i, val){
//     console.log(elem, i, val);
//     return '100rem';
// });
// $('#box').outerWidth(function(i, val){
//     console.log(this, i, val);
//     return '100rem';
// });


// console.log(leoDom.$innerHeight('#box'));
// console.log($('#box').innerHeight());
// leoDom.$innerHeight('#box', '100rem');
// console.log(leoDom.$innerHeight('#box'));
// console.log($('#box').innerHeight());
// leoDom.$innerHeight('#box', '+=200');
// $('#box').innerHeight('+=200');
// console.log(leoDom.$innerHeight('#box'));
// console.log($('#box').innerHeight());
// leoDom.$innerHeight('#box', function(elem, i, val){
//     console.log(elem, i, val);
//     return '100rem';
// });
// $('#box').innerHeight(function(i, val){
//     console.log(this, i, val);
//     return '100rem';
// });

// console.log(leoDom.$outerHeight('#box'));
// console.log($('#box').outerHeight());
// leoDom.$outerHeight('#box', '100rem');
// console.log(leoDom.$outerHeight('#box'));
// console.log($('#box').outerHeight());
// leoDom.$outerHeight('#box', '+=200');
// $('#box').outerHeight('+=200');
// console.log(leoDom.$outerHeight('#box'));
// console.log($('#box').outerHeight());
// leoDom.$outerHeight('#box', function(elem, i, val){
//     console.log(elem, i, val);
//     return '100rem';
// });
// $('#box').outerHeight(function(i, val){
//     console.log(this, i, val);
//     return '100rem';
// });

var div = leoDom.$tag('div');
var div1 = leoDom.$qsa('div');

var i = leoDom.$tag('input');
var i1 = leoDom.$qsa('input');

var result = leoDom.$id('result');

console.log(div, leoDom.isNodeList(div), div1, leoDom.isNodeList(div1));

console.log(i, leoDom.isNodeList(i), i1, leoDom.isNodeList(i1));

console.log(leoDom.isNodeList(result));

console.log(i1 instanceof window.NodeList);
