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

    replyAndQuoteButton.updateMessageHoverContainer = TS.ui.messages.updateMessageHoverContainer;

    TS.ui.messages.updateMessageHoverContainer = function($msg) {
      var t = $msg;

      // begin: TS.ui.messages.updateMessageHoverContainer original code
      t.removeClass("dirty_hover_container");var n=t.data("model-ob-id");var r=n?TS.redux.channels.getEntityById(n):TS.shared.legacyGetActiveModelOb();if(!r)return;var i=t.attr("data-ts");var a=TS.utility.msgs.getMsg(i,r.msgs);!a&&r._archive_msgs&&(a=TS.utility.msgs.getMsg(i,r._archive_msgs));!a&&TS.model.unread_view_is_showing&&(a=TS.client.unread.getMessage(r,i));a||(a=TS.ui.replies.getActiveMessage(r,i));a||(a=TS.client.threads.getMessage(r,i));if(!a){TS.error(i+" not found in "+n);return}var s=t.find("[data-js=action_hover_container]");var o=t.closest("ts-conversation").length>0;var l=t.closest("#threads_msgs").length>0;var u=TS.boot_data.feature_sli_briefing&&t.closest("#sli_briefing").length>0;var d=o||l;var _=!a.thread_ts||a.thread_ts===a.ts;var c="tombstone"===a.subtype&&r.is_channel&&!r.is_member;s.html(TS.templates.action_hover_items({msg:a,actions:TS.utility.msgs.getMsgActions(a,r),ts_tip_delay_class:"ts_tip_delay_60",is_in_threads_view:l,is_in_thread:d,is_root_msg:_,is_briefing_msg:u,hide_actions_menu:c,show_rxn_action:!!s.data("show_rxn_action"),show_reply_action:!!s.data("show_reply_action"),show_comment_action:!!s.data("show_comment_action"),abs_permalink:s.data("abs_permalink")}));s.toggleClass("narrow_buttons",s.children().length>3)
      // end
      
      var $ahc = s;

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
          var user_id = userURL.split("/")[2];
          var user = TS.model.members.find(function(user, index, array){
            return user.id === user_id;
          });
          var user_name = user._display_name_normalized_lc || user._real_name_normalized_lc;

          // Reply Button
          var rawMessage = messageContent.children("span.message_body").html();
          var message = rawMessage ? rawMessage.replace(/<br>/g, "\n") : "";
          $ahc.prepend($("<button></button>", {
            "type": "button",
            "class": "ts_icon_share_filled " + buttonClass,
            "data-action": "reply2",
            "data-user": user_name,
            "data-message": message,
            "data-permalink": permalink,
          }).append($("<span></span>", {class: "ts_tip_tip", text: "Reply"})));

          // Mention Button
          $ahc.prepend($("<button></button>", {
            "type": "button",
            "class": "ts_icon_mentions " + buttonClass,
            "data-action": "mention",
            "data-user": user_name,
          }).append($("<span></span>", {class: "ts_tip_tip", text: "Mention"})));
        }
      } catch(e) {
        console.error("SlackReplyAndQuoteButtonError.");
        console.info(e.stack);
        console.log("url: " + permalink);
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
