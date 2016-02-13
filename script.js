document.body.appendChild(function() {
  var script = document.createElement("script");

  var code = function() {
    var originalBuildMsgHTML = TS.templates.builders.buildMsgHTML;

    TS.templates.builders.buildMsgHTML = function(O, h) {
      var target = $(originalBuildMsgHTML(O, h));

      var messageContent = target.children('.message_content');
      var container = target.children('.action_hover_container');
      var buttonClass = "ts_icon ts_tip ts_tip_top ts_tip_float ts_tip_delay_600 ts_tip_hide ts_tip_hidden";

      // Quote Button
      var url = messageContent.children('a.timestamp').attr("href");
      var quoteButton = $("<a></a>", {
        class: "ts_icon_quote " + buttonClass,
        "data-action": "quote",
        "data-url": url,
      }).append($("<span></span>", {class: "ts_tip_tip", text: "Quote"}));
      container.prepend(quoteButton);

      // Reply Button
      var userUrl = messageContent.find("a.message_sender").attr('href');
      if (userUrl != null) {
        var user = userUrl.split('/')[2];
        var message = messageContent.children("span.message_body").text();
        var replyButton = $("<a></a>", {
          class: "ts_icon_reply " + buttonClass,
          "data-action": "reply",
          "data-user": user,
          "data-message": message,
        }).append($("<span></span>", {class: "ts_tip_tip", text: "Reply"}));
        container.prepend(replyButton);
      }

      return selfHtml(target);
    }

    var selfHtml = function(target) {
      var html = "";
      for(var i = 0, l = target.length; i < l; i++) {
        html += target[i].outerHTML
      }
      return html;
    }

    $(document).on("click", '.ts_icon_quote', function(event) {
      var messageInput = document.getElementById('message-input');
      var url = $(event.target).data('url');
      messageInput.value += '\n' + "https://" + location.host + '/' + url;
      messageInput.focus();
      $('#message-input').trigger("autosize").trigger("autosize-resize");
    });

    $(document).on("click", '.ts_icon_reply', function(event) {
      var messageInput = document.getElementById('message-input');
      var message = $(event.target).data('message');
      messageInput.value += '@' + $(event.target).data('user') + ':\n' + ( message ? '>' + message + '\n' : "" );
      messageInput.focus();
      $('#message-input').trigger("autosize").trigger("autosize-resize");
    });
  }

  src = "(" + code.toString() + ")()"
  script.type="text/javascript";
  script.text=src
  return script;
}());
