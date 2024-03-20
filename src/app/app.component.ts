import { Component, OnInit } from '@angular/core';
import imageCompression from 'browser-image-compression';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize, take } from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ImageCompressor';
  imageArray: any = []
  i: number = 0;
  show: any;
  downloadURL: any;
  logo: any;

  constructor(
    private storage: AngularFireStorage
  ) {

  }
  ngOnInit() {

  }



  close() {
    document.getElementById('exampleModalCenter')?.classList.remove('show')
  }




  async onFileSelected(data: any) {
    let images = data.target.files
    if (images.length > 1) {
      document.getElementById('exampleModalCenter')?.classList.add('show')
    }
    else {
      for (let x = 0; x < images.length; x++) {
        var fileSize = this.bytesToSize(images[x].size);

        var obj = {
          name: images[x]['name'],
          size: fileSize,
          btn: 'Disable',
          img: images
        }

        this.imageArray.push(obj)
        if (images.length == 1) {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true
          }
          const compressedFile = await imageCompression(images[0], options).then(e => {
            var cSize = this.bytesToSize(e.size)
            this.imageArray.map((item: any) => {
              if (item['name'] == e.name) {
                item['compressSize'] = cSize;
                var differencePercentage = (((images[0].size - e.size) / images[0].size) * 100).toFixed(2); //Minus Percentage
                // var perc = ((e.size / images[0].size) * 100).toFixed(2);  // Plus Percentage
                item['compressPercentage'] = (differencePercentage)
                var fileSize = this.bytesToSize(images[0].size);
                var n = Date.now();
                const file = images[0];
                const filePath = `image/${n}`;
                const fileRef = this.storage.ref(filePath);
                const task = this.storage.upload(`image/${n}`, file);
                task
                  .snapshotChanges()
                  .pipe(
                    finalize(() => {
                      this.downloadURL = fileRef.getDownloadURL();
                      this.downloadURL.subscribe((url: any) => {
                        if (url) {
                          // var obj = {
                          //   name: images[0]['name'],
                          //   size: fileSize,
                          //   btn: 'Disable',
                          //   url: url
                          // }
                          // this.imageArray.push(obj)
                          // if (images.length == 1) {
                          //   this.move((this.imageArray.length - 1))
                          // }
                          this.logo = url;
                          item['url'] = url
                        }
                        console.log('image' + this.logo);
                      });
                    })
                  )
                  .subscribe(url => {
                    if (url) {
                      console.log(url);
                    }
                  });
              }
            })
            this.move((this.imageArray.length - 1))

          })

        }
        else if (images.length > 0) {

        }
      }
    }


  }
  bytesToSize(bytes: any) {
    // var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    // if (bytes == 0) return '0 Byte';
    // var i = Number(Math.floor(Math.log(bytes) / Math.log(1024)));
    // return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
    var units = ['B', 'KB', 'MB', 'GB', 'TB'],
      bytes,
      i;

    for (i = 0; bytes >= 1024 && i < 4; i++) {
      bytes /= 1024;
    }

    return bytes.toFixed(2) + units[i];
  }


  move(idx: any) {
    if (this.i == 0) {
      this.i = 1;
      var width = 1;
      var _this = this;
      var id = setInterval(function () {
        var elemid = 'myBar-' + idx;
        var progressid = 'progress_bar-' + idx
        var elem = document.getElementById(elemid) as HTMLElement;
        var prog = document.getElementById(progressid) as HTMLElement;
        var spin = document.getElementById(`myBarClass-${idx}`) as HTMLElement;
        if (width >= 100) {
          _this.imageArray[idx].btn = 'Enable'
          clearInterval(id);
          _this.i = 0;
        } else {
          elem.classList.remove('hide')
          spin.classList.add('hide')
          width++;
          elem.style.width = ''
          elem.style.width = width + "%";
          prog.innerHTML = ''
          prog.innerHTML = width + "%";
        }
      }, 10);
    }
  }

  downlaod(url: string, image: any) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", image, true);
    xhr.responseType = "blob";
    xhr.onload = function () {
      var urlCreator = window.URL || window.webkitURL;
      var imageUrl = urlCreator.createObjectURL(this.response);
      var tag = document.createElement('a');
      tag.href = imageUrl;
      tag.download = url;
      document.body.appendChild(tag);
      tag.click();
      document.body.removeChild(tag);
    }
    xhr.send();
  }

}
