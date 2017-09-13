window.addEventListener('load', init)

function init () {
  const token = window.localStorage.getItem('accessToken')

  if (token) {
    const outlet = document.getElementById('outlet')

    outlet.setAttribute('style', 'display: block')

    showButton()
  } else {
    showLogin()
  }
}

function showButton () {
  const getDataButton = document.getElementById('get-solo')

  getDataButton.addEventListener('click', function (e) {
    e.preventDefault()

    window.fetch('/api/v1/solo', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${window.localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    })
      .then(status)
      .then(res => res.json())
      .then(render)
      .catch(console.error)
  })
}

function showLogin () {
  const loginForm = document.getElementById('login-form')

  loginForm.setAttribute('style', 'display: block')

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault()

    window.fetch('/auth', {
      method: 'POST',
      body: new window.FormData(loginForm)
    })
      .then(status)
      .then(res => res.json())
      .then(storeToken)
      .catch(console.error)
  })
}

function render ({ data }) {
  const list = document.getElementById('list')
  const getDataButton = document.getElementById('get-solo')

  getDataButton.setAttribute('style', 'display: none')

  data.forEach(function (region) {
    const li = document.createElement('li')
    const content = document.createTextNode(`${region._id.regionName}: ${region.total}`)

    li.appendChild(content)

    list.appendChild(li)
  })
}

function status (response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
}

function storeToken (response) {
  window.localStorage.setItem('accessToken', response.token)

  const loginForm = document.getElementById('login-form')
  const outlet = document.getElementById('outlet')

  loginForm.setAttribute('style', 'display: none')
  outlet.setAttribute('style', 'display: block')

  showButton()
}
