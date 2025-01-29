console.log('Script Loaded');

let songs = [];
let audio = new Audio();
let isPlaying = false;
let currentSongIndex = 0;

// Fetch songs
async function getSongs() {
    try {
        let response = await fetch('http://127.0.0.1:5500/songs/');
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let songLinks = div.getElementsByTagName("a");

        for (let link of songLinks) {
            if (link.href.endsWith('.mp3')) {
                songs.push(link.href);
            }
        }

        if (songs.length > 0) {
            renderSongList();
            renderCards();
            playSong(0); // Play the first song automatically
        } else {
            document.querySelector('.songList .no-songs').style.display = 'block';
        }
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

// Render song list
function renderSongList() {
    let songList = document.querySelector('.songList ul');
    songList.innerHTML = '';

    songs.forEach((song, index) => {
        let songName = decodeURIComponent(song.split('/').pop().replace('.mp3', '').replace(/%20/g, ' '));
        let listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${songName}`;
        
        if (index === currentSongIndex) {
            listItem.classList.add('current-play');
        }
        
        listItem.addEventListener('click', () => playSong(index));
        songList.appendChild(listItem);
    });
}

// Render song cards
function renderCards() {
    let cardContainer = document.querySelector('.cardContainer');
    cardContainer.innerHTML = '';
    cardContainer.style.display = 'flex';
    cardContainer.style.flexWrap = 'wrap';
    cardContainer.style.gap = '10px';

    songs.forEach((song, index) => {
        let card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;
        card.innerHTML = `
            <img src="https://th.bing.com/th/id/OIP._DKIdOXBtRJilTUTYMYgfwHaEY?rs=1&pid=ImgDetMain">
            <h2>${decodeURIComponent(song.split('/').pop().replace('.mp3', '').replace(/%20/g, ' '))}</h2>
            <p>Click to play this song</p>
        `;
        card.addEventListener('click', () => playSong(index));
        cardContainer.appendChild(card);
    });
}

// Play song
function playSong(index = 0) {
    currentSongIndex = index;
    audio.src = songs[currentSongIndex];
    audio.load();
    audio.play();
    isPlaying = true;
    updatePlayPauseButton();
    renderSongList();
}

// Update play/pause button
function updatePlayPauseButton() {
    let playButton = document.getElementById('play-btn');
    playButton.innerHTML = isPlaying ? '<img src="pause.svg" alt="Pause">' : '<img src="play.svg" alt="Play">';
}

// Toggle play/pause
function togglePlayPause() {
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }
    isPlaying = !isPlaying;
    updatePlayPauseButton();
}

// Next song
function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
}

// Previous song
function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
}

// Update seek bar
function updateSeekBar() {
    let seekBar = document.getElementById('seek-bar');
    let currentTime = document.getElementById('current-time');
    let duration = document.getElementById('duration');

    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            let progress = (audio.currentTime / audio.duration) * 100;
            seekBar.value = progress;
            currentTime.textContent = formatTime(audio.currentTime);
            duration.textContent = formatTime(audio.duration);
        }
    });

    seekBar.addEventListener('input', () => {
        let seekTo = (seekBar.value / 100) * audio.duration;
        audio.currentTime = seekTo;
    });
}

// Format time
function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Button events
document.getElementById('play-btn').addEventListener('click', togglePlayPause);
document.getElementById('next-btn').addEventListener('click', nextSong);
document.getElementById('prev-btn').addEventListener('click', prevSong);

audio.addEventListener('ended', nextSong);

// Initialize
getSongs();
updateSeekBar();
