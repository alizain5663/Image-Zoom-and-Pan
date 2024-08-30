var zoomer = (function () {
    var img_ele = null,
      x_cursor = 0,
      y_cursor = 0,
      x_img_ele = 0,
      y_img_ele = 0,
      orig_width = document.getElementById('zoom-img').getBoundingClientRect().width,
      orig_height = document.getElementById('zoom-img').getBoundingClientRect().height,
      current_top = 0,
      current_left = 0,
      zoom_factor = 1.5;
  
    return {
      zoom: function (zoomincrement, cursorX, cursorY) {
        img_ele = document.getElementById('zoom-img');
        zoom_factor = zoom_factor + zoomincrement;
        if (zoom_factor <= 1.0) {
          zoom_factor = 1.0;
          img_ele.style.top = '0px';
          img_ele.style.left = '0px';
        }
  
        var pre_width = img_ele.getBoundingClientRect().width,
          pre_height = img_ele.getBoundingClientRect().height;
  
        var new_width = orig_width * zoom_factor;
        var new_height = orig_height * zoom_factor;
  
        // Calculate the difference in dimensions
        var delta_width = new_width - pre_width;
        var delta_height = new_height - pre_height;
  
        // Calculate image offsets relative to the cursor position
        var rect = img_ele.getBoundingClientRect();
        var offsetX = (cursorX - rect.left) / pre_width; // Percentage of image width where cursor is
        var offsetY = (cursorY - rect.top) / pre_height; // Percentage of image height where cursor is
  
        // Adjust the image's top and left properties to zoom towards the cursor
        current_left -= delta_width * offsetX;
        current_top -= delta_height * offsetY;
  
        // Boundary checks to prevent the image from moving out of the container
        if (current_left > 0) current_left = 0;
        if (current_top > 0) current_top = 0;
        if (current_left < orig_width - new_width) current_left = orig_width - new_width;
        if (current_top < orig_height - new_height) current_top = orig_height - new_height;
  
        img_ele.style.left = current_left + 'px';
        img_ele.style.top = current_top + 'px';
        img_ele.style.width = new_width + 'px';
        img_ele.style.height = new_height + 'px';
  
        img_ele = null;
      },
  
      start_drag: function () {
        if (zoom_factor <= 1.0) {
          return;
        }
        img_ele = this;
        x_img_ele = window.event.clientX - document.getElementById('zoom-img').offsetLeft;
        y_img_ele = window.event.clientY - document.getElementById('zoom-img').offsetTop;
      },
  
      stop_drag: function () {
        if (img_ele !== null) {
          if (zoom_factor <= 1.0) {
            img_ele.style.left = '0px';
            img_ele.style.top = '0px';
          }
        }
        img_ele = null;
      },
  
      while_drag: function () {
        if (img_ele !== null) {
          var x_cursor = window.event.clientX;
          var y_cursor = window.event.clientY;
          var new_left = x_cursor - x_img_ele;
          if (new_left > 0) {
            new_left = 0;
          }
          if (new_left < orig_width - img_ele.width) {
            new_left = orig_width - img_ele.width;
          }
          var new_top = y_cursor - y_img_ele;
          if (new_top > 0) {
            new_top = 0;
          }
          if (new_top < orig_height - img_ele.height) {
            new_top = orig_height - img_ele.height;
          }
          current_left = new_left;
          img_ele.style.left = new_left + 'px';
          current_top = new_top;
          img_ele.style.top = new_top + 'px';
        }
      },
  
      // Handle zooming with mouse wheel
      handle_wheel: function (event) {
        event.preventDefault();
        const zoom_increment = event.deltaY < 0 ? 0.1 : -0.1; // Zoom in for scroll up, zoom out for scroll down
        this.zoom(zoom_increment, event.clientX, event.clientY); // Pass cursor position
      },
    };
  })();
  

  
  document.getElementById('zoom-img').addEventListener('mousedown', zoomer.start_drag);
  document.getElementById('zoom-container').addEventListener('mousemove', zoomer.while_drag);
  document.getElementById('zoom-container').addEventListener('mouseup', zoomer.stop_drag);
  document.getElementById('zoom-container').addEventListener('mouseout', zoomer.stop_drag);
  
  // Add wheel event listener for zooming with the mouse wheel
  document.getElementById('zoom-img').addEventListener('wheel', function (event) {
    zoomer.handle_wheel(event);
  });