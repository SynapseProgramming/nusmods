define(['backbone.marionette', 'zeroclipboard', 'hbs!../templates/url_sharing'],
  function(Marionette, ZeroClipboard, template) {
  'use strict';

  return Marionette.ItemView.extend({
    template: template,

    initialize: function() {
      ZeroClipboard.config({
        swfPath: 'bower_components/ZeroClipboard/dist/ZeroClipboard.swf'
      });

      var copyToClipboard = $('#copy-to-clipboard'),
          clip = new ZeroClipboard(copyToClipboard),
          shortURLInput = $('#short-url');

      function getShortURL(callback) {
        var shortURL = shortURLInput.val();
        if (shortURL) {
          callback(shortURL);
        } else {
          $.getJSON('short_url.php', {
            url: location.href
          }, function(data) {
            shortURL = data.shorturl;
            if (shortURL) {
              shortURLInput.val(shortURL);
              callback(shortURL);
            }
          });
        }
      }

      shortURLInput.on('cut keydown', function (event) {
        // Prevent default actions on cut and keydown to simulate readOnly
        // behavior on input, as the readOnly attribute does not allow selection
        // on some mobile platforms.
        event.preventDefault();
      }).focus(function() {
        getShortURL(function() {
          // shortURLInput.select() does not work on iOS
          shortURLInput[0].setSelectionRange(0, 99);
        });
      }).mouseup(function (event) {
        // Prevent the mouseup event from unselecting the selection
        event.preventDefault();
      });

      var CLIPBOARD_TOOLTIP = 'Copy to Clipboard';
      copyToClipboard.qtip({
        content: CLIPBOARD_TOOLTIP,
        events: {
          hidden: function() {
            // Set to original text when hidden as text may have been changed.
            copyToClipboard.qtip('option', 'content.text', CLIPBOARD_TOOLTIP);
          }
        }
      });
      copyToClipboard.on('mouseover', function() {
        getShortURL(function(shortURL) {
          clip.setText(shortURL);
        });
      });
      clip.on('aftercopy', function() {
        copyToClipboard.qtip('option', 'content.text', 'Copied!');
      });

      $('#share-email').click(function() {
        getShortURL(function(shortURL) {
          window.location.href = 'mailto:?subject=My%20NUSMods.com%20Timetable&' +
              'body=' + encodeURIComponent(shortURL);
        });
      }).qtip({
            content: 'Share via Email'
          });

      $('#share-facebook').click(function() {
        getShortURL(function(shortURL) {
          window.open('http://www.facebook.com/sharer.php?u=' +
              encodeURIComponent(shortURL), '', 'width=660,height=350');
        });
      }).qtip({
            content: 'Share via Facebook'
          });

      $('#share-twitter').click(function() {
        getShortURL(function(shortURL) {
          window.open('http://twitter.com/intent/tweet?url=' +
              encodeURIComponent(shortURL), '', 'width=660,height=350');
        });
      }).qtip({
            content: 'Share via Twitter'
          });
    }
  });
});
