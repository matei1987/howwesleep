d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};

var convertToTime = function(time) {
  var mins = Math.floor(time % 60);
  var hours = Math.floor(time / 60);
  if (mins < 0) {
    mins += 60;
  }
  if (mins < 10 && mins > -1) {
    mins = '0' + mins;
  }
  if (time > 0) {
    if (hours === 0) {
      return '12:' + mins + 'am'
    }
    return hours + ':' + mins + 'am'
  } else {
    if (hours === 0) {
      return '12:' + mins + 'pm'
    }
    return (hours + 12) + ':' + mins + 'pm'
  }
}

function filterOutliers(someArray) {
  if (someArray.length < 5) {
    return someArray;
  }
  var values = someArray.concat();

  values.sort(function(a, b) {
    return a - b;
  });

  var q1 = values[Math.floor((values.length / 4))];
  var q3 = values[Math.ceil((values.length * (3 / 4)))];
  var iqr = q3 - q1;
  var maxValue = q3 + iqr * 1.5;
  var minValue = q1 - iqr * 1.5;
  var filteredValues = values.filter(function(x) {
    return (x < maxValue) && (x > minValue);
  });
  return filteredValues;
}

var sheets = [{
  key: '1Sr_yXYY5FaCYWf_naPdL0dJDqG9BnPII-DwVHHlVdY8',
  user: 'Matei_27'
}, {
  key: '15zXydR8M_CnUGKOPDTbtkPActKqwWUrFwvNuCVdW7AY',
  user: 'Chad_39'
}, {
  key: '159CoQO-gV4Mh5QPmz4lOa6zN0KUrECyzdy3n3vSDhyo',
  user: 'Steve_27'
}, {
  key: '1qiyiqgt1gfhkT4cA5bqOIfUJkgyte69_ik0duvpyr_w',
  user: 'Vincent_26'
}, {
  key: '1yUzJ-QpsCYLp1yW7PS8LYFOdGml76yCTc8bRzTQ6RWs',
  user: 'Alex_27'
}, {
  key: '1_wcd_aP35pc4HFYilRk27lC-XUOmWrasOUiMvah5tjU',
  user: 'Lauren_29'
}, {
  key: '1PnekObrE-4tK9PogoaIDGZtAfUWCEMXr45rnGbZlppU',
  user: 'Orion_33'
}, {
  key: '1O-cchZGeAUPKp8u6-gMqjDG8Y3kfUWAGIIgARqBKPas',
  user: 'Misha_29'
}]

var margin = {
  top: window.innerWidth * .1,
  right: window.innerWidth * .1,
  bottom: window.innerWidth * .1,
  left: window.innerWidth * .1
}

var width = window.innerWidth / 2.05 - margin.left - margin.right;
var height = window.innerWidth / 2.05 - margin.bottom - margin.top;
var fullCircle = 2 * Math.PI;
var core = width / 4;

function doIt() {
  for (var i = 0; i < sheets.length; i++) {
    $('.container').append('<div class = "blocks" id = "' + sheets[i].user + '"></div>');
    drawGraph(i)
  }
  if (window.innerWidth >= 1281 && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    wrapIt();
    startScroll();
  } else {
    $('link[href="onepage-scroll.css"]').remove();
    $('script[src="jquery.onepage-scroll.min.js"]').remove();
  }

}

function wrapIt() {
  for (var i = 1; i < sheets.length / 2 + 1; i++) {
    var k = i + 1;
    $('.container>div:nth-child(' + i + '), .container div:nth-child(' + (k) + ')').wrapAll('<section></section>')

  }
}

doIt();

var colorList = ['#2B70F7', '#AA6BF7', '#DD6554'];

$('#color li').each(function(i) {
  $(this).css({
    'background-color': colorList[i]
  })
})
$('#subjects').text(sheets.length)



function drawGraph(k) {
  xhr_get('https://spreadsheets.google.com/feeds/list/' + sheets[k].key + '/od6/public/values?alt=json-in-script').done(function(fdata) {

    $('#' + sheets[k].user)
      .append('<img src="img/moon.png" class = "moon"/>')
      .append('<img src="img/sun.png"  class = "sun"/>');

    var data = [];
    var awakenings = [];
    var meanStart = [];
    var meanEnd = []

    function addMinutes(date, minutes) {

      return new Date(date.getTime() + minutes * 60000);
    }

    function parseSheetData() {

      var tempDate = new Date();

      for (var i = 0; i < fdata.feed.entry.length; i++) {

        if (fdata.feed.entry[i]['gsx$starttime']['$t'] && fdata.feed.entry[i]['gsx$minutesasleep']['$t'] > 200 && fdata.feed.entry[i]['gsx$timeinbed']['$t'] < 700) {

          var tempDate = new Date();

          var temp = {
            startTime: tempDate.setHours(parseInt(fdata.feed.entry[i]['gsx$starttime']['$t'].split(':')[0]), parseInt(fdata.feed.entry[i]['gsx$starttime']['$t'].split(':')[1]), 0, 0),
            date: new Date(fdata.feed.entry[i]['gsx$date']['$t']),
            endTime: addMinutes(tempDate, (parseInt(fdata.feed.entry[i]['gsx$minutesasleep']['$t']) + parseInt(fdata.feed.entry[i]['gsx$minutesawake']['$t']) + parseInt(fdata.feed.entry[i]['gsx$minutesafterwakeup']['$t']))),
            awakeCount: fdata.feed.entry[i]['gsx$awakeningscount']['$t']
          }

          if (temp.date.getDay() != 0 && temp.date.getDay() != 6) {
            awakenings.push(temp.awakeCount);
            data.push(temp)
          }
          console.log(temp.startTime.toLocaleString(), temp.endTime.toLocaleString())
        }
      };
      data.reverse();
      console.log(data);
      data = data.slice(0, 30);
      awakenings = awakenings.slice(0, 30);
    }

    parseSheetData();

    var colors = d3.scale.threshold()
      .domain([10, 15, d3.max(awakenings)])
      .range(colorList);

    var opacity = d3.scale.linear()
      .domain([0, data.length])
      .range([.5, .1])

    var arcScale = d3.scale.ordinal()
      .domain(d3.range(0, data.length))
      .rangeBands([core, d3.min([height, width]) / 1.6], 0.1);

    var minTime = new Date();
    var maxTime = new Date();
    minTime.setHours(0, 0, 0, 0);
    maxTime.setHours(24, 0, 0, 0);

    var angleScale = d3.scale.linear()
      .domain([minTime, maxTime])
      .range([0, fullCircle]);

    var arc = d3.svg.arc()
      .innerRadius(function(d, i) {
        return arcScale(i) - arcScale.rangeBand()
      })
      .outerRadius(function(d, i) {
        return arcScale(i)
      })
      .startAngle(function(d, i) {
        if (angleScale(d.startTime) > (fullCircle / 2)) {
          meanStart.push(angleScale(d.startTime) - fullCircle)
          return (angleScale(d.startTime) - fullCircle)
        }
        meanStart.push(angleScale(d.startTime))
        return angleScale(d.startTime)
      })
      .endAngle(function(d, i) {
        if (angleScale(d.startTime) > (fullCircle / 2)) {
          meanEnd.push(angleScale(d.endTime) - fullCircle)
          return angleScale(d.endTime) - fullCircle
        }
        meanEnd.push(angleScale(d.endTime))
        return angleScale(d.endTime)
      });

    var svg = d3.select('#' + sheets[k].user)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + parseInt((width / 2) + margin.left) + "," + parseInt((height / 2) + margin.top) + ")");

    d3.select('#' + sheets[k].user).append('text')
      .text(sheets[k].user.replace(/_/g, " | "))
      .classed('persons', true);

    var myArc = svg.selectAll('.path').data(data)
      .enter().append('path')
      .attr('transform', function(d) {
        return ('rotate(' + Math.random() * 360 + ')');
      })
      .style("fill", function(d, i) {
        return colors(d.awakeCount)
      })
      .style('fill-opacity', function(d, i) {
        return opacity(i)
      })
      .classed('arcs', true)
      .attr("d", arc);

    myArc.transition()
      .delay(function(d, i) {
        return 2000 + i * 15
      })
      .duration(400)
      .ease('linear')
      .style('fill-opacity', 0.9)
      .transition()
      .delay(function(d, i) {
        return 400 * sheets.length + i * 25
      })
      .ease('elastic')
      .duration(2000)
      .attr('transform', 'rotate(0)')
      .each('end', function(d, i) {
        myMean.transition()
          .ease('swing')
          .style({
            'stroke-width': '2px',
            'fill-opacity': '0.7'
          })
          .ease('swing')
          .duration(300)
          .attr('transform', 'rotate(0)')
          .each('end', function(d, i) {
            myAvg.moveToFront();
            myOptimal.moveToFront();

            myOptimal.transition()
              .delay(1200)
              .style({
                'stroke-width': '4px',
                'stroke': "rgba(9, 231, 42, 0.9)"
              })

            .duration(2400)
              .attr('transform', 'rotate(0)')
              .ease('elastic')
              .each('start', function() {
                $(this).closest('div').find('.optBedTime').css({
                  'color': 'rgba(9, 231, 42, 0.7)'
                })

              })

            myAvg.transition()
              .style({
                'stroke-width': '4px'
              })
              .style('stroke', function(d, i) {
                var optHours = Math.floor(optBedTime / 60);
                var realHours = Math.floor(avgWake / 60);
                if (optHours < realHours) {
                  $(this).closest('div').find('.avgBedTime').css({
                    'color': 'rgba(255, 110, 114, 0.9)'
                  })
                  return 'rgba(255, 110, 114, 0.9)';
                } else if (optHours > realHours) {
                  $(this).closest('div').find('.avgBedTime').css({
                    'color': 'rgba(9, 231, 42, 0.7)'
                  })
                  return 'rgba(9, 231, 42, 0.7)';
                } else {
                  var optMins = Math.floor(optBedTime % 60);
                  var realMins = Math.floor(avgWake % 60);
                  if (optMins < realMins) {
                    $(this).closest('div').find('.avgBedTime').css({
                      'color': 'rgba(255, 110, 114, 0.9)'
                    })
                    return 'rgba(255, 110, 114, 0.9)';
                  } else if (optMins >= realMins) {
                    $(this).closest('div').find('.avgBedTime').css({
                      'color': 'rgba(9, 231, 42, 0.7)'
                    })
                    return 'rgba(9, 231, 42, 0.7)';
                  }
                }

              })
              .duration(2400)
              .attr('transform', 'rotate(0)')
              .ease('elastic')
              .each('end', function() {
                $(this).closest('div').find('.moon').css({
                  'top': $('.moon').height() / 1.5 + 'px'
                });
                $(this).closest('div').find('.sun').css({
                  'bottom': $('.sun').height() / 1.5 + 'px'
                });
                var pics = $(this).closest('div').find('img');
                pics.fadeTo(800, .8, function() {
                  $('#legend').fadeTo(500, 1, function() {
                    $('#title').fadeTo(500, 1, function() {
                      $('#counter').fadeTo(500, 1)
                    })
                  })
                });

              })
          })
      })

    var avgPie = d3.svg.arc()
      .outerRadius((d3.min([height, width]) / 1.6) - arcScale.rangeBand())
      .innerRadius(core - arcScale.rangeBand())
      .startAngle(d3.mean(filterOutliers(meanStart)))
      .endAngle(d3.mean(filterOutliers(meanStart)))

    var meanPie = d3.svg.arc()
      .outerRadius((d3.min([height, width]) / 1.6) - arcScale.rangeBand())
      .innerRadius(core - arcScale.rangeBand())
      .startAngle(d3.mean(filterOutliers(meanEnd)) - fullCircle)
      .endAngle(d3.mean(filterOutliers(meanStart)))

    var optimalPie = d3.svg.arc()
      .outerRadius((d3.min([height, width]) / 1.6) - arcScale.rangeBand())
      .innerRadius(core - arcScale.rangeBand())
      .startAngle((d3.mean(filterOutliers(meanEnd)) - fullCircle) + (fullCircle * (2 / 3)))
      .endAngle((d3.mean(filterOutliers(meanEnd)) - fullCircle) + (fullCircle * (2 / 3)))



    var optBedTime = ((d3.mean(filterOutliers(meanEnd)) - fullCircle) + (fullCircle * (2 / 3))) / fullCircle * 1440;
    var avgWake = ((d3.mean(filterOutliers(meanStart))) / fullCircle * 1440);
    var avgBedTime = ((d3.mean(filterOutliers(meanEnd))) / fullCircle * 1440);

    var myOptimal = svg.append("path")
      .attr("d", optimalPie)
      .classed('.optLine', true)
      .attr('transform', function(d) {
        return ('rotate(250)');
      })
      .style({
        'stroke-width': '0',
        'stroke-dasharray': '8, 16',
        'stroke-opacity': '0.9'
      })

    var myAvg = svg.append("path")
      .attr("d", avgPie)
      .classed('.avgLine', true)
      .attr('transform', function(d) {
        return ('rotate(250)');
      })
      .style({
        'stroke': 'rgba(255, 110, 114, 0.7)',
        'stroke-width': '0',
        'stroke-dasharray': '8,16',
        'stroke-opacity': '0.8'
      })

    var myMean = svg.append("path")
      .attr("d", meanPie)
      .attr('transform', function(d) {
        return ('rotate(' + Math.random() * 360 + ')');
      })
      .style({
        'stroke': '#a9a9a9',
        'stroke-opacity': '0.2',
        'stroke-width': '0',
        'stroke-dasharray': '4, 20',
        'fill': '#1d1d1d',
        'fill-opacity': '0'
      })

    var avgSleep = (((d3.mean(filterOutliers(meanEnd)) + fullCircle) - (d3.mean(filterOutliers(meanStart)) + fullCircle)) * 1440) / fullCircle;

    d3.select('#' + sheets[k].user).append('text')
      .text('avg. sleep : ' + Math.floor(avgSleep / 60) + 'h ' + Math.floor(avgSleep % 60) + 'min')
      .classed('avgSleep', true);


    d3.select('#' + sheets[k].user).append('text')
      .text('avg. bed time : ' + convertToTime(avgWake))
      .classed('avgBedTime', true);
    d3.select('#' + sheets[k].user).append('text')
      .text('avg. wake up : ' + convertToTime(avgBedTime))
      .classed('avgWake', true);
    d3.select('#' + sheets[k].user).append('text')
      .text('optimal bed time : ' + convertToTime(optBedTime))
      .classed('optBedTime', true);

    $('.persons, .sixAM, .sixPM, .avgSleep, .avgWake, .avgBedTime, .optBedTime').css({
      'top': ((height + margin.bottom + margin.top) / 2 - 50) + 'px'
    })
    $('.container section>div').css({
      'margin-top': (window.innerHeight - height) / 4 + 'px'
    })


  });
}

function xhr_get(url) {
  return $.ajax({
    url: url,
    type: 'GET',
    dataType: 'jsonp'
  });
}

function startScroll() {
  $(".container").onepage_scroll({
    sectionContainer: "section", // sectionContainer accepts any kind of selector in case you don't want to use section
    easing: "cubic-bezier(0.315, 0.930, 0.525, 1.205)", // Easing options accepts the CSS3 easing animation such "ease", "linear", "ease-in",
    // "ease-out", "ease-in-out", or even cubic bezier value such as "cubic-bezier(0.175, 0.885, 0.420, 1.310)"
    animationTime: 700, // AnimationTime let you define how long each section takes to animate
    pagination: false, // You can either show or hide the pagination. Toggle true for show, false for hide.
    updateURL: false, // Toggle this true if you want the URL to be updated automatically when the user scroll to each page.
    beforeMove: function(index) {}, // This option accepts a callback function. The function will be called before the page moves.
    afterMove: function(index) {}, // This option accepts a callback function. The function will be called after the page moves.
    loop: false, // You can have the page loop back to the top/bottom when the user navigates at up/down on the first/last page.
    keyboard: true, // You can activate the keyboard controls
    responsiveFallback: 1440, // You can fallback to normal page scroll by defining the width of the browser in which
    // you want the responsive fallback to be triggered. For example, set this to 600 and whenever
    // the browser's width is less than 600, the fallback will kick in.
    direction: "vertical" // You can now define the direction of the One Page Scroll animation. Options available are "vertical" and "horizontal". The default value is "vertical".  
  });
}