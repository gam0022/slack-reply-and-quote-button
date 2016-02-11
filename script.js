document.body.appendChild(function() {
  sc = document.createElement("script");

  var code = function() {
    var orgFunc = TS.templates.builders.buildMsgHTML;
    TS.templates.builders.buildMsgHTML = function(O, h) {
      var target = orgFunc(O, h);
      if (!$(target)[0].id.startsWith('msg_')) {
        return target;
      }
      var msg = $(target);
      var menu = msg.children('.action_hover_container');
      var msgContent = msg.children('.message_content');
      var timeStampA = msgContent.children('a.timestamp');
      var refUrl = $(timeStampA).attr("href");
      var quoteBtn = $('<a data-action="quote" class="ts_icon ts_tip ts_tip_top ts_tip_float ts_tip_delay_600 ts_tip_hide ts_tip_hidden" data-refurl="' + refUrl + '" onclick="onQuoteClick(this)"><span class="ts_tip_tip">Quote</span>Qt</a>');
      quoteBtn = menu.find('[data-action="copy_link"]').after(quoteBtn);
      var href = msgContent.find("a.message_sender").attr('href');
      var senderUser = href != null ? href.split('/')[2] : "error";
      var repMessage = jQuery.trim(msgContent.children("span.message_body").text()).match(/^.*$/m)[0];
      if(!repMessage)
        repMessage = jQuery.trim(msgContent.children("span.msg_inline_file_preview_title").text()).match(/^.*$/m)[0];
      var replyBtn = $('<a data-action="reply" class="ts_icon ts_tip ts_tip_top ts_tip_float ts_tip_delay_600 ts_tip_hide ts_tip_hidden" data-user="' + senderUser + '" data-repMes="' + repMessage + '" onclick="onReplyClick(this)"><span class="ts_tip_tip">Reply</span>Re</a>');
      quoteBtn.after(replyBtn);
      return msg[0].outerHTML;
    }

    onQuoteClick = function(target) {
      var messageText = document.getElementById('message-input');
      messageText.value += '\n' + (/https:\/\/[a-zA-Z0-9-]+\.slack\.com/g).exec(location.href)[0] + $(target).data('refurl');
      $('#message-input').trigger("autosize").trigger("autosize-resize");
    }

    onReplyClick = function(target){
      var messageText = document.getElementById('message-input');
      messageText.value = '@' + $(target).data('user') + ' :\n' + ( $(target).data('repmes') ? ( '>' + $(target).data('repmes') + '\n' ) : "" ) + messageText.value;
      $('#message-input').trigger("autosize").trigger("autosize-resize");
    }
  }

  src = "("+code.toString()+")()"
  sc.type="text/javascript";
  sc.text=src
  return sc;
}());
