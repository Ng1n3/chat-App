const $messageForm = document.querySelector("#message-form");
const $messageFromInput = $messageForm.querySelector("input");
const $messageFromButton = $messageForm.querySelector("button");
const $sendButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const socket = io();

// ELements

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

//optoins
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});


const autoScroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // console.log(newMessageMargin)

  //visible height
  const visibleHeight = $messages.offsetHeight

  // Height of messages container
  const containerHeight = $messages.scrollHeight

  // How far have I scrolled?
  const scrollOffSet = $messages.scrollTop + visibleHeight


  if(containerHeight - newMessageHeight <= scrollOffSet) {
    $messages.scrollTop = $messages.scrollHeight
  }



}


socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});




$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFromButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;
  // socket.emit('sendMessage', message);
  socket.emit("sendMessage", message, (error) => {
    $messageFromButton.removeAttribute("disabled");
    $messageFromInput.value = "";
    $messageFromInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log("Message delivered!");
  });
});

socket.on("locationMessage", (message) => {
  console.log(message);
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll()
});

socket.on('roomData', ({room, users}) => {
  const html = Mustache.render(sideBarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
  // autoScroll()
})

$sendButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }
  $sendButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const long = position.coords.longitude;
    socket.emit(
      "sendLocation",
      {
        longitude: long,
        latitude: lat,
      },
      () => {
        console.log("Location shared");
        $sendButton.removeAttribute("disabled");
      }
    );
  });
});

// socket.on('countUpdated', (count) => {
//   console.log('The count has been updated!', count)
// })

// message.addEventListener('click', () => {
//   console.log('Clicked')
//   socket.emit('increment')
// })

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/'
  }
});
