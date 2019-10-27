const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $chatSideBar = document.querySelector('#chat__sidebar')
const $sideBarTemplate = document.querySelector('#sidebar-message-template')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

// username and room
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error);
        return location.href = '/';
    }
});

const autoscroll = () => {
    const containerHeight = $messages.scrollHeight;
    const visibleHeight = $messages.offsetHeight;
    const newMessageHeight = $messages.lastElementChild.offsetHeight + parseInt(getComputedStyle($messages.lastElementChild).marginBottom) 
    if(containerHeight - newMessageHeight <=  $messages.scrollTop + visibleHeight)
        $messages.scrollTop = containerHeight
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll();
})



socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username:message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll();
})

socket.on('userdata',({room,users})=>{  
    const html = Mustache.render($sideBarTemplate.innerHTML,{
        room,
        users: users
    });
    $chatSideBar.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})