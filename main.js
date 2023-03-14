const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playlist = $('.playlist');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const leftTimeLine = $('.left-timeline');
const rightTimeLine = $('.right-timeline');

const app = {
   currentIndex: 0,
   isPlaying: false,
   isRandom: false,
   isRepeat: false,
   config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
   songs: [
      {
         name: "Bài Ka Tuổi Trẻ",
         singer: "Tam Ka",
         path: "./assets/music/song_1.mp3",
         image: "./assets/img/song_1.jpg",
         duration: `${audio.duration}`
      },
      {
          name: "Đếm Ngày Xa Em",
          singer: "Only C, Lou Hoàng",
          path: "./assets/music/song_2.mp3",
          image: "./assets/img/song_2.jpg" 
       },
       {
          name: "Đừng Chờ Anh Nữa",
          singer: "Tăng Phúc",
          path: "./assets/music/song_3.mp3",
          image: "./assets/img/song_3.jpg" 
       },
       {
          name: "Giá Như Anh Lặng Im",
          singer: "Only C, Lou Hoàng, Quang Hùng",
          path: "./assets/music/song_4.mp3",
          image: "./assets/img/song_4.jpg" 
       },
       {
          name: "Người Ấy",
          singer: "Trịnh Thăng Bình",
          path: "./assets/music/song_5.mp3",
          image: "./assets/img/song_5.jpg" 
       },
       {
           name: "Nơi Ấy Con Tìm Về",
           singer: "Hồ Quang Hiếu",
           path: "./assets/music/song_6.mp3",
           image: "./assets/img/song_6.jpg" 
        },
        {
           name: "Remember Me",
           singer: "Sơn Tùng MTP, SlimV",
           path: "./assets/music/song_7.mp3",
           image: "./assets/img/song_7.jpg" 
        },
        {
           name: "Thấm Thía",
           singer: "Tống Gia Vỹ",
           path: "./assets/music/song_8.mp3",
           image: "./assets/img/song_8.jpg" 
        },
        {
         name: "Thu cuối",
         singer: "Yanbi, Mr.T, Hằng BingBoong",
         path: "./assets/music/song_9.mp3",
         image: "./assets/img/song_9.jpg" 
      }
  ],
  setConfig: function(key, value) {
      this.config[key] = value;
      localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function() {
      const htmls = this.songs.map((song, index) => {
         return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
               <div class="thumb" style="background-image: url('${song.image}')">
               </div>
               <div class="body">
               <h3 class="title">${song.name}</h3>
               <p class="author">${song.singer}</p>
               </div>
               <div class="option">
               <i class="fas fa-ellipsis-h"></i>
               </div>
            </div>
         `
      })
      playlist.innerHTML = htmls.join('');
  },
  defineProperties: function() {
      Object.defineProperty(this, 'currentSong', {
         get: function() {
            return this.songs[this.currentIndex]
         }
      })
  },
  handleEvents: function() {
      const _this = this;
      const cdWidth = cd.offsetWidth;
      console.log(cdWidth);

      // Xử lý CD quay / dừng
      const cdThumbAnimate = cdThumb.animate([
         {transform: 'rotate(360deg'}
      ], {
         duration: 10000,
         iterations: Infinity
      });
      cdThumbAnimate.pause();

      // Xử lý phóng to / thu nhỏ CD
      document.onscroll = function() {
         const scrollTop = window.scrollY  || document.documentElement.scrollTop;
         const newCdWidth = cdWidth - scrollTop;

         cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
         cd.style.opacity = newCdWidth / cdWidth;
      }

      // Xử lý khi click play
      playBtn.onclick = function() {
         if (_this.isPlaying) { 
            audio.pause();
            cdThumbAnimate.pause();        
         }
         else {
            audio.play();
            cdThumbAnimate.play();
         }
      }

      // Khi bài hát được phát
      audio.onplay = function() {
         _this.isPlaying = true;
         player.classList.add('playing');
      }

      // Khi bài hát bị dừng
      audio.onpause = function() {
         _this.isPlaying = false;
         player.classList.remove('playing');
      }

      // Khi tiến độ bài hát thay đổi
      audio.ontimeupdate = function() {
         if (audio.duration) {
            const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
            progress.value = progressPercent;
            leftTimeLine.textContent = _this.setTimeLine(audio.currentTime);
            rightTimeLine.textContent = _this.setTimeLine(audio.duration);
         }
      }

      // Xử lý khi tua bài hát
      progress.oninput = function(e) {
         const seekTime = e.target.value / 100 * audio.duration;
         audio.currentTime = seekTime;
      }

      // Khi sang bài hát sau
      nextBtn.onclick = function() {
         if (_this.isRandom) {
            _this.playRandomSong();
         }
         else {
            _this.nextSong();
         }
         audio.play();
         _this.render();
         _this.scrollToActiveSong();
      }

      // Khi trở lại bài hát trước
      prevBtn.onclick = function() {
         
         if (_this.isRandom) {
            _this.playRandomSong();
         }
         else {
            _this.prevSong();
         }
         audio.play();
         _this.render();
         _this.scrollToActiveSong();
      }

      // Xử lý bật / tắt nút random bài hát
      randomBtn.onclick = function() {
         _this.isRandom = !_this.isRandom;
         _this.setConfig('isRandom', _this.isRandom);
         randomBtn.classList.toggle('active', _this.isRandom);
      }

      // Xử lý khi bật / tắt nút lặp lại bài hát
      repeatBtn.onclick = function() {
         _this.isRepeat = !_this.isRepeat;
         _this.setConfig('isRepeat', _this.isRepeat);
         repeatBtn.classList.toggle('active', _this.isRepeat);
      }

      // Xử lý sang bài hát sau khi kết thúc bài hát
      audio.onended = function() {
         if (_this.isRandom) {
            _this.playRandomSong();
         }
         else if (_this.isRepeat) {
            _this.playReapeatSong();
         }
         else {
            _this.nextSong();
         }
         _this.render();
         audio.play();
      }

      // Lắng nghe hành vi click vào playlist
      playlist.onclick = function(e) {
         const songNode = e.target.closest('.song:not(.active');

         if (songNode || e.target.closest('.option')) {
            // Xử lý khi click vào bài hát khác
            if (songNode) {
               _this.currentIndex = Number(songNode.dataset.index);
               _this.loadCurrentSong();
               _this.render();
               audio.play();
            }

            // Xử lý khi click vào option
            if (e.target.closest('.option')) {

            }
         }
      }
  },
  loadConfig: function() {
      this.isRandom = this.config.isRandom;
      this.isRepeat = this.config.isRepeat;
  },
  loadCurrentSong: function() {
      heading.textContent = this.currentSong.name;
      cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
      audio.src = this.currentSong.path;
  },
  setTimeLine: function(time) {
      let timeLine = '';
      let minutes = Math.floor(time / 60);
      let seconds = Math.floor(time - minutes * 60);
      if (time < 600) {
         if (seconds < 10) {
            timeLine = `0${minutes}:0${seconds}`;
         }
         else {
            timeLine = `0${minutes}:${seconds}`;
         }
      }
      return timeLine;
  },
  nextSong: function() {
      this.currentIndex++;
      if (this.currentIndex > this.songs.length - 1) {
         this.currentIndex = 0;
      }

      this.loadCurrentSong();
  },
  prevSong: function() {
      this.currentIndex--;
      if (this.currentIndex < 0) {
         this.currentIndex = this.songs.length - 1;
      }

      this.loadCurrentSong();
  },
  playRandomSong: function() {
      let newIndex;
      do {
         newIndex = Math.floor(Math.random() * this.songs.length);
         
         console.log(newIndex);
      } while (newIndex === this.currentIndex);
      this.currentIndex = newIndex;
      this.loadCurrentSong();
  },
  playReapeatSong: function() {
      this.loadCurrentSong();
  },
  scrollToActiveSong: function()    {
      const activeSong = $('.song.active');
      setTimeout(() => {
         activeSong.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
         })
      }, 300)
      
  },
  start: function() {
      // Gán cấu hình từ config vào ứng dụng
      this.loadConfig();

      // Định nghĩa các thuộc tính cho object
      this.defineProperties();

      // Lắng nghe / xử lý các sự kiện
      this.handleEvents();

      // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
      this.loadCurrentSong();

      // Render playlist
      this.render();

      // Hiển thị trạng thái ban đầu của button repeat & random
      randomBtn.classList.toggle('active', app.isRandom);
      repeatBtn.classList.toggle('active', app.isRepeat);
  }
}

app.start()
 