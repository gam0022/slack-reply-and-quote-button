document.body.appendChild(function() {
  var code = function() {
    var originalBuildMsgHTML = TS.templates.builders.buildMsgHTML;

    TS.templates.builders.buildMsgHTML = function(O, h) {
      var originalHTML = originalBuildMsgHTML(O, h);
      try {
        var target = $(originalHTML);
        var container = target.children(".action_hover_container");
        var messageContent = target.children(".message_content");
        var buttonClass = "ts_icon ts_tip ts_tip_top ts_tip_float ts_tip_delay_600 ts_tip_hidden";

        // Quote Button
        var permalink = container.children("[data-action='copy_link']").data("permalink");
        container.prepend($("<a></a>", {
          "class": "ts_icon_quote " + buttonClass,
          "data-action": "quote",
          "data-permalink": permalink,
        }).append($("<span></span>", {class: "ts_tip_tip", text: "Quote"})));

        // Reply Button
        var userURL = messageContent.children("a.message_sender").attr("href");
        if (userURL != null) {
          var user = userURL.split("/")[2];
          var message = messageContent.children("span.message_body").text().replace(/\s+/g, "");
          container.prepend($("<a></a>", {
            "class": "ts_icon_reply " + buttonClass,
            "data-action": "reply",
            "data-user": user,
            "data-message": message,
          }).append($("<span></span>", {class: "ts_tip_tip", text: "Reply"})));
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
      var messageInput = document.getElementById("message-input");
      var permalink = $(event.target).data("permalink");
      messageInput.value += "\n" + permalink;
      messageInput.focus();
      $("#message-input").trigger("autosize").trigger("autosize-resize");
    });

    $(document).on("click", "[data-action='reply']", function(event) {
      var messageInput = document.getElementById("message-input");
      var user = $(event.target).data("user");
      var message = $(event.target).data("message");
      messageInput.value = "@" + user + ":\n" + ( message ? ">" + message + "\n" : "" ) + messageInput.value;
      messageInput.focus();
      $("#message-input").trigger("autosize").trigger("autosize-resize");
    });
  };

  var script = document.createElement("script");
  script.type = "text/javascript";
  script.text = "(" + code.toString() + ")()";
  return script;
}());
