// ==UserScript==
// // @name         slack-reply-and-quote-button
// // @namespace    http://gam0022.net/
// // @version      1.3.0.0
// // @description  Add a reply(mention) and quotation button to Slack.
// // @author       gam0022
// // @match        http://*.slack.com/*
// // @match        https://*.slack.com/*
// // @run-at       document-end
// // @grant        none
// // ==/UserScript==

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
        var buttonClass = "ts_icon ts_tip ts_tip_top ts_tip_float ts_tip_delay_60";
        var permalink = $ahc.data("abs_permalink");

        // Quote Button
        $ahc.prepend($("<a></a>", {
          "class": "ts_icon_quote " + buttonClass,
          "data-action": "quote",
          "data-permalink": permalink,
        }).append($("<span></span>", {class: "ts_tip_tip", text: "Quote"})));

        var userURL = messageContent.children("a.message_sender").attr("href");
        if (userURL != null) {
          // Reply Button
          var user = userURL.split("/")[2];
          var rawMessage = messageContent.children("span.message_body").html();
          var message = rawMessage ? rawMessage.replace(/<br>/g, "\n") : "";
          $ahc.prepend($("<a></a>", {
            "class": "ts_icon_reply " + buttonClass,
            "data-action": "reply",
            "data-user": user,
            "data-message": message,
            "data-permalink": permalink,
          }).append($("<span></span>", {class: "ts_tip_tip", text: "Reply"})));

          // Mention Button
          $ahc.prepend($("<a></a>", {
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
      var messageInput = document.getElementById("message-input");
      var permalink = $(event.target).data("permalink");
      var selectedText = replyAndQuoteButton.selectedText;
      messageInput.value += "\n" + (selectedText !== "" ? replyAndQuoteButton.quoteText(selectedText) : permalink);

      messageInput.focus();
      messageInput.selectionStart = 0;
      messageInput.selectionEnd = 0;

      $("#message-input").trigger("autosize").trigger("autosize-resize");
    });

    $(document).on("mousedown", "[data-action='reply']", function(event) {
      var selectedText = document.getSelection().toString();
      replyAndQuoteButton.selectedText = selectedText;
    });

    $(document).on("click", "[data-action='reply']", function(event) {
      var messageInput = document.getElementById("message-input");
      var user = $(event.target).data("user");
      var permalink = $(event.target).data("permalink");
      var messageText = $(event.target).data("message");
      var selectedText = replyAndQuoteButton.selectedText;
      messageInput.value = "@" + user + ":\n" +  replyAndQuoteButton.getQuotedText(messageText, selectedText, permalink) + "\n" + messageInput.value;
      messageInput.focus();
      $("#message-input").trigger("autosize").trigger("autosize-resize");
    });

    $(document).on("click", "[data-action='mention']", function(event) {
      var messageInput = document.getElementById("message-input");
      var user = $(event.target).data("user");
      messageInput.value = "@" + user + ":\n" + messageInput.value;
      messageInput.focus();
      $("#message-input").trigger("autosize").trigger("autosize-resize");
    });
  };

  var script = document.createElement("script");
  script.type = "text/javascript";
  script.text = "(" + code.toString() + ")()";
  return script;
}());
