'use strict';

/**
 * exclude parts within page by drawing black rectangle
 */

module.exports = function(shot, excludeRect) {

    excludeRect.forEach(function(rect) {

        if(Object.keys(rect).length > 4) {

            var points = [];
            for(var i = 0; i < Object.keys(rect).length / 2; i++) {
                points.push([rect['x'+i] , rect['y'+i]]);
            }

            shot.drawPolygon(points);

        } else {

            shot.drawRectangle(rect.x0, rect.y0, rect.x1, rect.y1);

        }

    });

};
