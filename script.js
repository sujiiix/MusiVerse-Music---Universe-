console.log("Lets begin");
let currentSong = new Audio();
let songs;
let currfolder;

function formatSeconds(inputSeconds) {
  if (isNaN(inputSeconds)) {
    return "00:00";
  }
  const totalSeconds = Math.floor(inputSeconds); // Ensure whole seconds
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  const formattedMins = String(mins).padStart(2, '0');
  const formattedSecs = String(secs).padStart(2, '0');

  return `${formattedMins}:${formattedSecs}`;
}

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`/${folder}/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response
  let as = div.getElementsByTagName("a")
  songs = []
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }
  }

  //Show all the songs in the playlist
  let songsUL = document.querySelector(".songLists").getElementsByTagName("ul")[0]
  songsUL.innerHTML = ""
  for (const song of songs) {
    songsUL.innerHTML = songsUL.innerHTML + `<li>
                            <img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Sujii</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div></li>`
  }



  //Attach an event listener to each song
  Array.from(document.querySelector(".songLists").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
    })
  })

  return songs

}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currfolder}/` + track
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
  let a = await fetch(`/songs/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response
  let anchors =div.getElementsByTagName("a")
  let cardContainer = document.querySelector(".cardContainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
        let folder = e.href.split("/").slice(-2)[0]
        // Get the metadata of the folder
        let a = await fetch(`/songs/${folder}/info.json`)
        let response = await a.json();
        cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play-button">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="12" r="12" fill="#1fdf64" />
                                <g transform="scale(0.7) translate(5, 5)">
                                    <path
                                        d="M7.05 3.606L20.54 11.394a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"
                                        fill="black" />
                                </g>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
    }
  }

  //Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item =>{
      console.log("Fetching Songs")
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0])
    })
  })

}


async function main() {
  // Get the lists of songs
  songs = await getSongs("songs/cs")
  playMusic(songs[0], true)

  //Display all albums on page
  displayAlbums()

  //Attach an event Liistener to play next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play()
      play.src = "pause.svg";
    }
    else {
      currentSong.pause()
      play.src = "play.svg"
    }
  })

  //Listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatSeconds(currentSong.currentTime)}/${formatSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  })

  //Add an event listener to seekar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100
  })

  //Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })

  //Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  })

  //Add event listener to prev and next button
  prev.addEventListener("click", () => {
    currentSong.pause()
    console.log("Previous Clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1])
    }
  })

  next.addEventListener("click", () => {
    currentSong.pause()
    console.log("Next Clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1])
    }
  })

  //Add an event to volume 
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("Setting volume to ", e.target.value, "/100")
    currentSong.volume = parseInt(e.target.value) / 100
  })

  //Add event listener to mute volume
  document.querySelector(".volume>img").addEventListener("click", e=>{
    if(e.target.src.includes("volume.svg")){
      e.target.src= e.target.src.replace("volume.svg","mute.svg")
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value=0
    }
    else{
      e.target.src = e.target.src.replace("mute.svg","volume.svg")
      currentSong.volume = .10
      document.querySelector(".range").getElementsByTagName("input")[0].value=10
    }
  })

  //Load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click",async item => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
    })
  })


}

main()
