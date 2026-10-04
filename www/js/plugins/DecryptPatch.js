//=============================================================================
// DecryptPatch.js
//=============================================================================

(function() {
    var KEY = "cbf45b48176a036e58bd338a2b8f326d";

    // DataManager veritabanı yüklendiğinde şifreleme verilerini zorla
    var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        if (!_DataManager_isDatabaseLoaded.call(this)) return false;
        
        if ($dataSystem) {
            $dataSystem.hasEncryptedImages = true;
            $dataSystem.hasEncryptedAudio = true;
            $dataSystem.encryptionKey = KEY;
        }
        return true;
    };

    // Decrypter nesnesi hazır olduğunda anahtarı doğrudan enjekte et
    if (typeof Decrypter !== 'undefined') {
        Decrypter.hasEncryptedImages = true;
        Decrypter.hasEncryptedAudio = true;
        Decrypter._encryptionKey = KEY;
    }
})();
