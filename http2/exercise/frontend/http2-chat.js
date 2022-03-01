const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");

// this will hold all the most recent messages
let allChat = [];

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = {
    user,
    text,
  };

  // request options
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };

  // send POST request
  // we're not sending any json back, but we could
  await fetch("/msgs", options);
}

async function getNewMsgs() {
  let reader;
  const uft8decoder = new TextDecoder('utf-8');

  try {
    const res = await fetch('/msgs');
    reader = res.body.getReader(); // turns reader into a readable text stream, since we set up the backend this way
  } catch (err) {
    console.log("reader connection error ", + err);
  }

  presence.innerHTML = 'OK';

  let readerResponse;
  let done;

  do {
    try {
      readerResponse = await reader.read(); // wait here until the API sends me something new back
    } catch (err) {
      console.log('reader fail ' + err);
      presence.innerHTML = 'FAIL';
      return;
    }

    const chunk = uft8decoder.decode(readerResponse.value, { stream: true });
    done = readerResponse.done;

    if (chunk) {
      try {
        const json = JSON.parse(chunk);
        allChat = json.msg;
        render()
      } catch (err) {
        console.error('parse error ', + err)
      }
    }

  } while(!done);
  presence.innerHTML = 'FAIL';
}

function render() {
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

getNewMsgs();
