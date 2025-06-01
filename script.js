function isPowerOfTwo(x) {
    return (x & (x - 1)) === 0 && x !== 0;
}

// veri bit uzunluğuna göre toplam kod uzunluğunu hesapla (parity bitleri + genel parity)
function getTotalLength(dataLen) {
    let r = 1;
    while (Math.pow(2, r) < dataLen + r + 1) r++;
    return dataLen + r + 1; // +1 genel parity biti için
}

// bit uzunluğu değiştiğinde input ve dropdownu güncelle
function bitUzunluguDegisti() {
    const bitLength = parseInt(document.getElementById("bitLength").value);
    const input = document.getElementById("dataInput");
    input.value = "";
    input.maxLength = bitLength;
    input.placeholder = `Sadece 0 ve 1 girin, uzunluk: ${bitLength}`;

    const errorPos = document.getElementById("errorPos");
    errorPos.innerHTML = '<option value="">Seç</option>';
    const totalBits = getTotalLength(bitLength);
    for (let i = 1; i <= totalBits; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = i;
        errorPos.appendChild(opt);
    }

    // onceki sonuçları temizle
    document.getElementById("output").textContent = "";
    document.getElementById("overallParity").textContent = "";
    document.getElementById("duzeltilmisKod").textContent = "";
    document.getElementById("hataDurumu").textContent = "";
}

// hamming kodu oluştur
function kodla() {
    const bitLength = parseInt(document.getElementById("bitLength").value);
    const data = document.getElementById("dataInput").value.trim();

    if (data.length !== bitLength) {
        alert(`Lütfen tam olarak ${bitLength} bit girin!`);
        return;
    }
    if (!/^[01]+$/.test(data)) {
        alert("Sadece 0 ve 1 girilebilir!");
        return;
    }

    const dataBits = data.split("").map(Number);
    const totalBits = getTotalLength(bitLength);

    // kod dizisi (1-based index, 0. index boş)
    const code = Array(totalBits + 1).fill(0);

    // veri bitlerini yerleştiriyoruz (parity ve genel parity pozisyonları hariç)
    let dataIndex = 0;
    for (let i = 1; i <= totalBits; i++) {
        if (!isPowerOfTwo(i) && i !== totalBits) { 
            // son bit genel parity, parity pozisyonları güç 2 olanlar
            code[i] = dataBits[dataIndex++];
        }
    }

    // parity bitlerini hesapla (genel parity hariç)
    for (let i = 1; i < totalBits; i <<= 1) {
        let parity = 0;
        for (let j = 1; j < totalBits; j++) { // genel parity son bit, hariç tut
            if ((j & i) !== 0) parity ^= code[j];
        }
        code[i] = parity;
    }

    // genel parity bitini hesapla (tüm bitlerin parity'si)
    let overallParity = 0;
    for (let i = 1; i < totalBits; i++) overallParity ^= code[i];
    code[totalBits] = overallParity;

    // sonucu göster
    document.getElementById("output").textContent = code.slice(1).join("");
    document.getElementById("overallParity").textContent = overallParity;
    document.getElementById("duzeltilmisKod").textContent = "";
    document.getElementById("hataDurumu").textContent = "Kod oluşturuldu, hata yok.";
}

// rastgele hata oluştur
function hataOlustur() {
    const codeStr = document.getElementById("output").textContent;
    if (!codeStr) return alert("Önce kod oluşturun!");

    const code = codeStr.split("");
    const pos = Math.floor(Math.random() * code.length);
    code[pos] = code[pos] === "0" ? "1" : "0";

    document.getElementById("output").textContent = code.join("");
    document.getElementById("hataDurumu").textContent = `${pos + 1}. bitten rastgele hata oluşturuldu.`;
    document.getElementById("duzeltilmisKod").textContent = "";
}

// seçilen pozisyonda hata oluştur
function hataOlusturDropdown() {
    const pos = parseInt(document.getElementById("errorPos").value);
    if (!pos) return alert("Hata pozisyonu seçin!");
    const codeStr = document.getElementById("output").textContent;
    if (!codeStr) return alert("Önce kod oluşturun!");

    const code = codeStr.split("");
    code[pos - 1] = code[pos - 1] === "0" ? "1" : "0";

    document.getElementById("output").textContent = code.join("");
    document.getElementById("hataDurumu").textContent = `${pos}. bitten hata oluşturuldu.`;
    document.getElementById("duzeltilmisKod").textContent = "";
}

// hata kontrol et ve düzelt
function hataKontrolEt() {
    const codeStr = document.getElementById("output").textContent;
    if (!codeStr) return alert("Önce kod oluşturun!");

    const code = [0].concat(codeStr.split("").map(Number)); // 1-based index
    const totalBits = code.length - 1;

    let errorPos = 0;

    // parity bitlerini kontrol et (genel parity hariç)
    for (let i = 1; i < totalBits; i <<= 1) {
        let parity = 0;
        for (let j = 1; j < totalBits; j++) {
            if ((j & i) !== 0) parity ^= code[j];
        }
        if (parity !== 0) errorPos += i;
    }

    // genel parity kontrolü
    let overallParity = 0;
    for (let i = 1; i <= totalBits; i++) overallParity ^= code[i];

    if (overallParity === 0 && errorPos === 0) {
        document.getElementById("hataDurumu").textContent = "Hata yok.";
        document.getElementById("duzeltilmisKod").textContent = code.slice(1).join("");
    } else if (overallParity === 1 && errorPos > 0) {
        // tek bit hata bulundu ve düzeltildi
        code[errorPos] ^= 1;
        document.getElementById("hataDurumu").textContent = `Hata ${errorPos}. bitte bulundu ve düzeltildi.`;
        document.getElementById("duzeltilmisKod").textContent = code.slice(1).join("");
    } else {
        // çift hata veya düzeltilemeyen hata
        document.getElementById("hataDurumu").textContent = "Çift hata algılandı, düzeltilemedi!";
        document.getElementById("duzeltilmisKod").textContent = "";
    }
}

// sayfa yüklendiğinde bit uzunluğunu ayarla
window.onload = bitUzunluguDegisti;
