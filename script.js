import './style.css';

var zoomer = (function () {
    var img_ele = document.getElementById('zoom-img'),
        orig_width = img_ele.getBoundingClientRect().width,
        orig_height = img_ele.getBoundingClientRect().height,
        current_top = 0,
        current_left = 0,
        zoom_factor = 1.5, // Default zoom factor for mobile screens
        min_zoom = 1.0,
        max_zoom = 3.0,
        last_touch_distance = 0,
        is_panning = false,
        is_zooming = false,
        start_panning_x = 0,
        start_panning_y = 0;

    function getClientCoords(event) {
        if (event.touches) {
            return {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY,
            };
        } else {
            return {
                x: event.clientX,
                y: event.clientY,
            };
        }
    }

    function updateOriginalDimensions() {
        orig_width = img_ele.getBoundingClientRect().width;
        orig_height = img_ele.getBoundingClientRect().height;
    }

    function calculateZoomFactor() {
        const screenWidth = window.innerWidth;
        if (screenWidth < 480) {
            return 1.5;
        } else if (screenWidth < 768) {
            return 1.3;
        } else if (screenWidth < 1024) {
            return 1.2;
        } else {
            return 1.0;
        }
    }

    function calculateTouchDistance(event) {
        if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const dx = touch2.clientX - touch1.clientX;
            const dy = touch2.clientY - touch1.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        }
        return 0;
    }

    function constrainPanning(new_left, new_top, new_width, new_height) {
        const containerRect = document.getElementById('zoom-container').getBoundingClientRect();
        if (new_left > 0) new_left = 0;
        if (new_top > 0) new_top = 0;
        if (new_left < containerRect.width - new_width) new_left = containerRect.width - new_width;
        if (new_top < containerRect.height - new_height) new_top = containerRect.height - new_height;
        return { left: new_left, top: new_top };
    }

    function logZoomFactor() {
        console.log('Zoom Factor:', zoom_factor);
    }

    function logCurrentState() {
        console.log('Current Left:', current_left);
        console.log('Current Top:', current_top);
        console.log('Image Width:', img_ele.style.width);
        console.log('Image Height:', img_ele.style.height);
    }

    return {
        zoom: function (zoomincrement, cursorX, cursorY) {
            logZoomFactor();
            zoom_factor += zoomincrement;

            // Clamp zoom factor within min and max limits
            if (zoom_factor < min_zoom) zoom_factor = min_zoom;
            if (zoom_factor > max_zoom) zoom_factor = max_zoom;

            var pre_width = img_ele.getBoundingClientRect().width,
                pre_height = img_ele.getBoundingClientRect().height;

            var new_width = orig_width * zoom_factor;
            var new_height = orig_height * zoom_factor;

            var delta_width = new_width - pre_width;
            var delta_height = new_height - pre_height;

            var rect = img_ele.getBoundingClientRect();
            var offsetX = (cursorX - rect.left) / pre_width;
            var offsetY = (cursorY - rect.top) / pre_height;

            current_left -= delta_width * offsetX;
            current_top -= delta_height * offsetY;

            var constrained = constrainPanning(current_left, current_top, new_width, new_height);
            current_left = constrained.left;
            current_top = constrained.top;

            img_ele.style.left = current_left + 'px';
            img_ele.style.top = current_top + 'px';
            img_ele.style.width = new_width + 'px';
            img_ele.style.height = new_height + 'px';
        },

        start_drag: function (event) {
            if (event.touches && event.touches.length === 2) {
                is_zooming = true;
                last_touch_distance = calculateTouchDistance(event);
                return;
            }
            if (!is_zooming) {
                is_panning = true;
                var coords = getClientCoords(event);
                start_panning_x = coords.x - img_ele.getBoundingClientRect().left;
                start_panning_y = coords.y - img_ele.getBoundingClientRect().top;
            }
        },

        stop_drag: function () {
            is_panning = false;
            is_zooming = false;
        },

        while_drag: function (event) {
            logCurrentState();
            if (is_panning) {
                var coords = getClientCoords(event);
                var new_left = coords.x - start_panning_x;
                var new_top = coords.y - start_panning_y;

                var constrained = constrainPanning(new_left, new_top, img_ele.getBoundingClientRect().width, img_ele.getBoundingClientRect().height);
                new_left = constrained.left;
                new_top = constrained.top;

                current_left = new_left;
                img_ele.style.left = new_left + 'px';
                current_top = new_top;
                img_ele.style.top = new_top + 'px';
            }
        },

        handle_wheel: function (event) {
            event.preventDefault();
            const zoom_increment = event.deltaY < 0 ? 0.1 : -0.1;
            this.zoom(zoom_increment, event.clientX, event.clientY);
        },

        handle_touchmove: function (event) {
            event.preventDefault(); // Prevent default scrolling behavior
            if (is_zooming && event.touches.length === 2) {
                const new_distance = calculateTouchDistance(event);
                const zoom_increment = (new_distance - last_touch_distance) / 100;

                last_touch_distance = new_distance;
                const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
                const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;

                // Apply the zoom and constrain it
                this.zoom(zoom_increment, centerX, centerY);
            } else if (is_panning) {
                this.while_drag(event);
            }
        },

        resize: function () {
            updateOriginalDimensions();
            zoom_factor = calculateZoomFactor();
            var new_width = orig_width * zoom_factor;
            var new_height = orig_height * zoom_factor;

            // Center the image in the viewport initially
            current_left = (document.getElementById('zoom-container').offsetWidth - new_width) / 2;
            current_top = (document.getElementById('zoom-container').offsetHeight - new_height) / 2;

            img_ele.style.left = current_left + 'px';
            img_ele.style.top = current_top + 'px';
            img_ele.style.width = new_width + 'px';
            img_ele.style.height = new_height + 'px';
        },
    };
})();

// Event listeners for dragging, zooming, and resizing
document.getElementById('zoom-img').addEventListener('mousedown', zoomer.start_drag.bind(zoomer));
document.getElementById('zoom-container').addEventListener('mousemove', zoomer.while_drag.bind(zoomer));
document.getElementById('zoom-container').addEventListener('mouseup', zoomer.stop_drag.bind(zoomer));
document.getElementById('zoom-container').addEventListener('mouseout', zoomer.stop_drag.bind(zoomer));
document.getElementById('zoom-img').addEventListener('wheel', function (event) {
    zoomer.handle_wheel(event);
});

// Touch event listeners
document.getElementById('zoom-img').addEventListener('touchstart', function (event) {
    event.preventDefault(); // Prevent default behavior
    zoomer.start_drag(event);
});

document.getElementById('zoom-container').addEventListener('touchmove', function (event) {
    event.preventDefault(); // Prevent default behavior
    zoomer.handle_touchmove(event);
});

document.getElementById('zoom-container').addEventListener('touchend', function (event) {
    event.preventDefault(); // Prevent default behavior
    zoomer.stop_drag(event);
});

document.getElementById('zoom-container').addEventListener('touchcancel', function (event) {
    event.preventDefault(); // Prevent default behavior
    zoomer.stop_drag(event);
});

// Adjust the image on window load and resize
window.addEventListener('load', function () {
    zoomer.resize();
});
window.addEventListener('resize', function () {
    zoomer.resize();
});

