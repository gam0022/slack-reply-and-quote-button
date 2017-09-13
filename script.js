document.body.appendChild(function() {
  var code = function() {
    var replyAndQuoteButton = {
      selectedText: '',

      selfHTML: function(target) {
        var html = "";
        for(var i = 0, l = target.length; i < l; i++) {
          html += target[i].outerHTML
        }
        return html;
      },

      quoteText: function(text) {
        return "> " + text.replace(/\n/g, "\n> ").replace(/<.+?>/g, "");
      },

      getQuotedText: function(messageText, selectedText, permalink) {
        if (selectedText !== "") {
          return replyAndQuoteButton.quoteText(selectedText);
        } else {
          var lineCount = messageText.split("\n").length;
          // 行数が3以下かつタグが含まれていない場合は > による引用にする
          if (messageText != "" && lineCount <= 3 && (messageText.indexOf("</div>") === -1) && (messageText.indexOf("</span>") === -1)) {
            return replyAndQuoteButton.quoteText(messageText);
          } else {
            return permalink;
          }
        }
      },

      normalizeNewline: function(text) {
        return '<p>' + text.replace(/\n/g, '</p><p>') + '</p>';
      },

      appendMessageInputText: function(text) {
        var messageInputText = $("#msg_input div")
        messageInputText.append(replyAndQuoteButton.normalizeNewline(text));

        var node = document.querySelector('#msg_input > .ql-editor');
        node.focus();
      },

      prependMessageInputText: function(text) {
        var messageInputText = $("#msg_input div")
        messageInputText.prepend(replyAndQuoteButton.normalizeNewline(text));

        // キャレットを末尾に移動させる(by nyamadandan)
        var node = document.querySelector('#msg_input > .ql-editor');
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStartAfter(node.lastChild);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);

        node.focus();
      },
    };

    TS.ui.messages.updateMessageHoverContainer = function($msg) {
      $msg.removeClass("dirty_hover_container");
      var model_ob_id = $msg.data("model-ob-id");
      var model_ob = model_ob_id ? TS.shared.getModelObById(model_ob_id) : TS.shared.getActiveModelOb();
      var msg_ts = $msg.data("ts");
      var msg = TS.utility.msgs.getMsg(msg_ts, model_ob.msgs);
      if (!msg && model_ob._archive_msgs)
        msg = TS.utility.msgs.getMsg(msg_ts, model_ob._archive_msgs);
      if (!msg) {
        TS.error(msg_ts + " not found in " + model_ob_id);
        return
      }
      var rxn_key = TS.rxns.getRxnKeyByMsgType(msg);
      var $ahc = $msg.find(".action_hover_container");
      $ahc.html(TS.templates.action_hover_items({
        msg: msg,
        actions: TS.utility.msgs.getMsgActions(msg, model_ob),
        default_rxns: TS.boot_data.feature_thanks && !TS.rxns.getExistingRxnsByKey(rxn_key) && TS.emoji.getDefaultRxns(),
        ts_tip_delay_class: "ts_tip_delay_60",
        show_rxn_action: !!$ahc.data("show_rxn_action"),
        show_reply_action: !!$ahc.data("show_reply_action"),
        show_jump_action: !!$ahc.data("show_jump_action"),
        show_comment_action: !!$ahc.data("show_comment_action"),
        abs_permalink: $ahc.data("abs_permalink")
      }))

      try {
        var messageContent = $msg.children(".message_content");
        var buttonClass = "btn_unstyle btn_msg_action ts_icon ts_tip ts_tip_top ts_tip_float ts_tip_delay_60 ts_tip_hidden";
        var permalink = $ahc.data("abs_permalink");

        // Quote Button
        $ahc.prepend($("<button></button>", {
          "type": "button",
          "class": "ts_icon_quote " + buttonClass,
          "data-action": "quote",
          "data-permalink": permalink,
        }).append($("<span></span>", {class: "ts_tip_tip", text: "Quote"})));

        var userURL = $msg.find("a.member_image:first").attr("href");
        if (userURL) {
          var user = userURL.split("/")[2];

          // Reply Button
          var rawMessage = messageContent.children("span.message_body").html();
          var message = rawMessage ? rawMessage.replace(/<br>/g, "\n") : "";
          $ahc.prepend($("<button></button>", {
            "type": "button",
            "class": "ts_icon_share_filled " + buttonClass,
            "data-action": "reply2",
            "data-user": user,
            "data-message": message,
            "data-permalink": permalink,
          }).append($("<span></span>", {class: "ts_tip_tip", text: "Reply"})));

          // Mention Button
          $ahc.prepend($("<button></button>", {
            "type": "button",
            "class": "ts_icon_mentions " + buttonClass,
            "data-action": "mention",
            "data-user": user,
          }).append($("<span></span>", {class: "ts_tip_tip", text: "Mention"})));
        }
      } catch(e) {
        console.error("SlackReplyAndQuoteButtonError.");
        console.info(e.stack);
        console.log("url: " + permalink);
        return originalHTML;
      }
    };

    $(document).on("mousedown", "[data-action='quote']", function(event) {
      var selectedText = document.getSelection().toString();
      replyAndQuoteButton.selectedText = selectedText;
    });

    $(document).on("click", "[data-action='quote']", function(event) {
      var permalink = $(event.target).data("permalink");
      var selectedText = replyAndQuoteButton.selectedText;
      replyAndQuoteButton.appendMessageInputText(selectedText !== "" ? replyAndQuoteButton.quoteText(selectedText) : permalink);
    });

    $(document).on("mousedown", "[data-action='reply2']", function(event) {
      var selectedText = document.getSelection().toString();
      replyAndQuoteButton.selectedText = selectedText;
    });

    $(document).on("click", "[data-action='reply2']", function(event) {
      var user = $(event.target).data("user");
      var permalink = $(event.target).data("permalink");
      var messageText = $(event.target).data("message");
      var selectedText = replyAndQuoteButton.selectedText;
      replyAndQuoteButton.prependMessageInputText("@" + user + ":\n" +  replyAndQuoteButton.getQuotedText(messageText, selectedText, permalink));
    });

    $(document).on("click", "[data-action='mention']", function(event) {
      var user = $(event.target).data("user");
      replyAndQuoteButton.prependMessageInputText("@" + user + ":");
    });
  };

  var script = document.createElement("script");
  script.type = "text/javascript";
  script.text = "(" + code.toString() + ")()";
  return script;
}());
