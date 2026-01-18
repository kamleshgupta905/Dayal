(function ($) {

  "use strict";

  // PRE LOADER
  $(window).on('load', function () {
    $('.preloader').fadeOut(1000); // set duration in brackets    
  });

  $(document).ready(function () {

    // Navigation Section
    try {
      $('.navbar-collapse a').on('click', function () {
        $(".navbar-collapse").collapse('hide');
      });
    } catch (e) { console.warn("Navigation error:", e); }

    // Owl Carousel
    try {
      if ($.fn.owlCarousel) {
        $('.owl-carousel').owlCarousel({
          animateOut: 'fadeOut',
          items: 1,
          loop: true,
          autoplay: true,
        });
      }
    } catch (e) { console.warn("Owl Carousel error:", e); }

    // PARALLAX EFFECT
    try {
      if ($.fn.stellar) {
        $.stellar();
      }
    } catch (e) { console.warn("Stellar error:", e); }

    // SMOOTHSCROLL
    try {
      $('.navbar-default a, #home a, footer a, .smoothScroll').on('click', function (event) {
        var $anchor = $(this);
        var href = $anchor.attr('href');
        if (href && href.indexOf('#') === 0) {
          var $target = $(href);
          if ($target.length) {
            $('html, body').stop().animate({
              scrollTop: $target.offset().top - 49
            }, 1000);
            event.preventDefault();
          }
        }
      });
    } catch (e) { console.warn("SmoothScroll error:", e); }

    // WOW ANIMATION
    try {
      if (typeof WOW !== 'undefined') {
        new WOW({ mobile: false }).init();
      }
    } catch (e) { console.warn("WOW error:", e); }

    // Appointment Form Submission (Improved)
    $('#appointment-form').on('submit', function (e) {
      e.preventDefault();
      var $form = $(this);
      var $submitBtn = $('#cf-submit');
      var originalBtnText = $submitBtn.text();

      $submitBtn.prop('disabled', true).text('Sending...');

      $.ajax({
        url: $form.attr('action'),
        method: 'POST',
        data: $form.serialize(),
        dataType: 'json',
        headers: {
          'Accept': 'application/json'
        },
        success: function (response) {
          $form.find('.wow').fadeOut(500).promise().done(function () {
            $('#form-success').fadeIn();
          });
          $form[0].reset();
          $submitBtn.text(originalBtnText).prop('disabled', false);
        },
        error: function (err) {
          console.error('Submission Error:', err);
          var errorMessage = 'Could not send your request. Please check your internet connection or try again later.';

          if (err.responseJSON && err.responseJSON.message) {
            errorMessage = "Error: " + err.responseJSON.message;
          } else if (err.responseJSON && err.responseJSON.error) {
            errorMessage = "Error: " + err.responseJSON.error;
          } else if (err.status) {
            errorMessage = "Submission Failed (Status " + err.status + "): " + err.statusText;
          }

          alert(errorMessage);
          $submitBtn.prop('disabled', false).text(originalBtnText);
        }
      });
    });

    // Initialize Map
    initMap();

  });


  // MAP LOGIC (Leaflet)
  var map, userMarker, hospitalMarker;
  var hospitalLocation = [27.2317, 79.0264]; // Example coordinates for Mainpuri, India

  function initMap() {
    if (typeof L === 'undefined' || !$('#map').length) return;

    try {
      map = L.map('map').setView(hospitalLocation, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Hospital Marker
      var hospitalIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/4320/4320337.png', // Medical icon
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });

      hospitalMarker = L.marker(hospitalLocation, { icon: hospitalIcon }).addTo(map)
        .bindPopup('<b>DH Hospital</b><br>Mainpuri, Uttar Pradesh')
        .openPopup();

      // Live User Location
      if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(function (position) {
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          var accuracy = position.coords.accuracy;

          if (!userMarker) {
            userMarker = L.circleMarker([lat, lng], {
              radius: 8,
              fillColor: "#2196F3",
              color: "#fff",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            }).addTo(map).bindPopup("You are here");

            $('#zoom-btn').fadeIn();
          } else {
            userMarker.setLatLng([lat, lng]);
          }

          $('#location-status').html('Location found! Accurate to ' + Math.round(accuracy) + ' meters.');
          $('#coords').text('Lat: ' + lat.toFixed(4) + ', Lng: ' + lng.toFixed(4));

        }, function (error) {
          console.warn('Geolocation error:', error);
          $('#location-status').text('Unable to retrieve your location. ' + error.message);
        }, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      } else {
        $('#location-status').text('Geolocation is not supported by your browser.');
      }
    } catch (e) { console.error("Map initialization error", e); }
  }

  // Global function for the zoom button
  window.zoomToUser = function () {
    if (userMarker) {
      map.setView(userMarker.getLatLng(), 15);
    } else {
      alert("Still waiting for your location...");
    }
  };

})(jQuery);
