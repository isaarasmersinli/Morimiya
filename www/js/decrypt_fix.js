(function() {
    // System.json dosyanızdan alınan özel şifreleme anahtarı
    var ENCRYPTION_KEY = "cbf45b48176a036e58bd338a2b8f326d"; 

    // RPG Maker Decrypter mimarisini aktif et
    Decrypter.hasEncryptedAudio = true;
    Decrypter._encryptionKey = ENCRYPTION_KEY;

    // Hex formatındaki Key'i 16 baytlık ArrayBuffer dizisine dönüştür
    if (ENCRYPTION_KEY) {
        var keyArray = [];
        for (var i = 0; i < ENCRYPTION_KEY.length; i += 2) {
            keyArray.push(parseInt(ENCRYPTION_KEY.substr(i, 2), 16));
        }
        Decrypter._headerArray = new Uint8Array(keyArray);
    }

    // RPG Maker'ın dahili WebAudio başlatıcısını yakala
    var _WebAudio_prototype_initialize = WebAudio.prototype.initialize;
    WebAudio.prototype.initialize = function(url) {
        // Uzantıyı .rpgmvo veya .rpgmvm formatına yönlendir
        if (url && !url.match(/\.(rpgmvo|rpgmvm)$/i)) {
            if (AudioManager.isOggSupported()) {
                url = url.replace(/\.ogg$/i, '') + '.rpgmvo';
            } else {
                url = url.replace(/\.m4a$/i, '') + '.rpgmvm';
            }
        }
        
        _WebAudio_prototype_initialize.call(this, url);
        this._hasEncryptedAudio = true;
    };

    // Ses yükleme isteğini (XHR) yakalayıp veriyi deşifre et
    WebAudio.prototype._load = function(url) {
        if (url) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function() {
                if (xhr.status < 400) {
                    var arrayBuffer = Decrypter.decryptArrayBuffer(xhr.response);
                    this._onXhrLoad(arrayBuffer);
                } else {
                    this._hasError = true;
                }
            }.bind(this);
            xhr.onerror = this._onError.bind(this);
            xhr.send();
        }
    };

    // Bellekteki ArrayBuffer verisinden RPG Maker başlığını temizleme
    Decrypter.decryptArrayBuffer = function(arrayBuffer) {
        if (!arrayBuffer) return null;
        
        var header = new Uint8Array(arrayBuffer, 0, 16);
        var ref = Decrypter._headerArray;

        // Başlık üzerindeki XOR deşifreleme adımı
        if (ref) {
            for (var i = 0; i < 16; i++) {
                header[i] = header[i] ^ ref[i];
            }
        }
        
        // Şifrelenmiş 16 baytlık başlığı kesip ham ses verisini döndür
        return arrayBuffer.slice(16);
    };

    console.log("Morimiya canlı ses deşifre modülü başarıyla yüklendi.");
})();

