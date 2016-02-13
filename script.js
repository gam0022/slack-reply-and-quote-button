document.body.appendChild(function() {
  var code = function() {
    var originalBuildMsgHTML = TS.templates.builders.buildMsgHTML;

    TS.templates.builders.buildMsgHTML = function(O, h) {
      var originalHTML = originalBuildMsgHTML(O, h);
      try {
        var target = $(originalHTML);
        var messageContent = target.children('.message_content');
        var container = target.children('.action_hover_container');
        var buttonClass = "ts_icon ts_tip ts_tip_top ts_tip_float ts_tip_delay_600 ts_tip_hide ts_tip_hidden";

        // Quote Button
        var url = messageContent.children('a.timestamp').attr("href");
        var quoteButton = $("<a></a>", {
          "class": "ts_icon_quote " + buttonClass,
          "data-action": "quote",
          "data-url": url,
        }).append($("<span></span>", {class: "ts_tip_tip", text: "Quote"}));
        container.prepend(quoteButton);

        // Reply Button
        var userURL = messageContent.find("a.message_sender").attr('href');
        if (userURL != null) {
          var user = userURL.split('/')[2];
          var message = messageContent.children("span.message_body").text();
          var replyButton = $("<a></a>", {
            "class": "ts_icon_reply " + buttonClass,
            "data-action": "reply",
            "data-user": user,
            "data-message": message,
          }).append($("<span></span>", {class: "ts_tip_tip", text: "Reply"}));
          container.prepend(replyButton);
        }

        return selfHTML(target);

      } catch(e) {
        console.error("SlackReplyAndQuoteButtonError.");
        console.info(e.stack);
        return originalHTML;
      }
    };

    var selfHTML = function(target) {
      var html = "";
      for(var i = 0, l = target.length; i < l; i++) {
        html += target[i].outerHTML
      }
      return html;
    };

    $(document).on("click", "[data-action='quote']", function(event) {
      var messageInput = document.getElementById('message-input');
      var url = $(event.target).data('url');
      messageInput.value += '\n' + "https://" + location.host + '/' + url;
      messageInput.focus();
      $('#message-input').trigger("autosize").trigger("autosize-resize");
    });

    $(document).on("click", "[data-action='reply']", function(event) {
      var messageInput = document.getElementById('message-input');
      var user = $(event.target).data('user');
      var message = $(event.target).data('message');
      messageInput.value = "@" + user + ':\n' + ( message ? '>' + message + '\n' : "" ) + messageInput.value;
      messageInput.focus();
      $('#message-input').trigger("autosize").trigger("autosize-resize");
    });
  };

  var script = document.createElement("script");
  script.type = "text/javascript";
  script.text = "(" + code.toString() + ")()";
  return script;
}());
