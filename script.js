document.body.appendChild(function() {
  var script = document.createElement("script");

  var code = function() {
    var originalBuildMsgHTML = TS.templates.builders.buildMsgHTML;

    TS.templates.builders.buildMsgHTML = function(O, h) {
      var target = $(originalBuildMsgHTML(O, h));

      var msgContent = target.children('.message_content');
      var container = target.children('.action_hover_container');
      var buttonClass = "ts_icon ts_tip ts_tip_top ts_tip_float ts_tip_delay_600 ts_tip_hide ts_tip_hidden";

      // Quote Button
      var refUrl = msgContent.children('a.timestamp').attr("href");
      var quoteButton = $('<a data-action="quote" class="ts_icon_quote ' + buttonClass + '" data-refurl="' + refUrl + '"><span class="ts_tip_tip">Quote</span></a>');
      quoteButton = container.find('[data-action="copy_link"]').after(quoteButton);

      // Reply Button
      var senderHref = msgContent.find("a.message_sender").attr('href');
      if (senderHref != null) {
        var senderUser = senderHref.split('/')[2];
        var repMessage = msgContent.children("span.message_body").text();
        var replyButton = $('<a data-action="reply" class="ts_icon_reply ' + buttonClass + '" data-user="' + senderUser + '" data-repMes="' + repMessage + '"><span class="ts_tip_tip">Reply</span></a>');
        quoteButton.after(replyButton);
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
      messageInput.value += '\n' + "https://" + location.host + '/' + $(event.target).data('refurl');
      messageInput.focus();
      $('#message-input').trigger("autosize").trigger("autosize-resize");
    });

    $(document).on("click", '.ts_icon_reply', function(event) {
      var messageInput = document.getElementById('message-input');
      messageInput.value += '@' + $(event.target).data('user') + ':\n' + ( $(event.target).data('repmes') ? ( '>' + $(event.target).data('repmes') + '\n' ) : "" );
      messageInput.focus();
      $('#message-input').trigger("autosize").trigger("autosize-resize");
    });
  }

  src = "(" + code.toString() + ")()"
  script.type="text/javascript";
  script.text=src
  return script;
}());
