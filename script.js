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
      var quoteButton = $('<a data-action="quote" class="' + buttonClass + '" data-refurl="' + refUrl + '" onclick="onQuoteClick(this)"><span class="ts_tip_tip">Quote</span>Qt</a>');
      quoteButton = container.find('[data-action="copy_link"]').after(quoteButton);

      // Reply Button
      var senderHref = msgContent.find("a.message_sender").attr('href');
      if (senderHref != null) {
        var senderUser = senderHref.split('/')[2];
        var repMessage = msgContent.children("span.message_body").text();
        var replyButton = $('<a data-action="reply" class="' + buttonClass + '" data-user="' + senderUser + '" data-repMes="' + repMessage + '" onclick="onReplyClick(this)"><span class="ts_tip_tip">Reply</span>Re</a>');
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

    onQuoteClick = function(target) {
      var messageText = document.getElementById('message-input');
      messageText.value += '\n' + "https://" + location.host + '/' + $(target).data('refurl');
      messageText.focus();
      $('#message-input').trigger("autosize").trigger("autosize-resize");
    }

    onReplyClick = function(target){
      var messageText = document.getElementById('message-input');
      messageText.value += '@' + $(target).data('user') + ':\n' + ( $(target).data('repmes') ? ( '>' + $(target).data('repmes') + '\n' ) : "" );
      messageText.focus();
      $('#message-input').trigger("autosize").trigger("autosize-resize");
    }
  }

  src = "(" + code.toString() + ")()"
  script.type="text/javascript";
  script.text=src
  return script;
}());
