document.body.appendChild(function() {
  var code = function() {
    var replyAndQuoteButton = {
      originalBuildMsgHTML: TS.templates.builders.buildMsgHTML,
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
          if (lineCount <= 3 && (messageText.indexOf("</div>") === -1) && (messageText.indexOf("</span>") === -1)) {
            return replyAndQuoteButton.quoteText(messageText);
          } else {
            return permalink;
          }
        }
      },
    };

    TS.templates.builders.buildMsgHTML = function(O, h) {
      var originalHTML = replyAndQuoteButton.originalBuildMsgHTML(O, h);
      try {
        var target = $(originalHTML);
        var container = target.children(".action_hover_container");
        var messageContent = target.children(".message_content");
        var buttonClass = "ts_icon ts_tip ts_tip_top ts_tip_float ts_tip_delay_600 ts_tip_hidden";
        var permalink = container.children("[data-action='copy_link']").data("permalink");

        // Quote Button
        container.prepend($("<a></a>", {
          "class": "ts_icon_quote " + buttonClass,
          "data-action": "quote",
          "data-permalink": permalink,
        }).append($("<span></span>", {class: "ts_tip_tip", text: "Quote"})));

        // Reply Button
        var userURL = messageContent.children("a.message_sender").attr("href");
        if (userURL != null) {
          var user = userURL.split("/")[2];
          var message = messageContent.children("span.message_body").html().replace(/<br>/g, "\n");
          container.prepend($("<a></a>", {
            "class": "ts_icon_reply " + buttonClass,
            "data-action": "reply",
            "data-user": user,
            "data-message": message,
            "data-permalink": permalink,
          }).append($("<span></span>", {class: "ts_tip_tip", text: "Reply"})));
        }

        return replyAndQuoteButton.selfHTML(target);

      } catch(e) {
        console.error("SlackReplyAndQuoteButtonError.");
        console.info(e.stack);
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
  };

  var script = document.createElement("script");
  script.type = "text/javascript";
  script.text = "(" + code.toString() + ")()";
  return script;
}());
