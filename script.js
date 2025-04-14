const apiUrl = "https://script.google.com/macros/s/AKfycbyYY_DjHL8SgLdBbuSNVS-F_Op66GbKq5MLSu2KBlyC71uCSRv88eKymDNRTBq4CMrBnw/exec";

const form = document.getElementById("recordForm");
const recordsContainer = document.getElementById("records");
const monthFilter = document.getElementById("monthFilter");
const totalDisplay = document.getElementById("total");

let allRecords = [];

async function loadRecords() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        allRecords = data.slice(1).map((record) => ({
            date: record[0],
            category: record[1],
            amount: Number(record[2]),
            note: record[3]
        }));
        renderRecords();
    } catch (error) {
        console.error("讀取紀錄時發生錯誤：", error);
    }
}

function renderRecords() {
    const month = monthFilter.value;
    recordsContainer.innerHTML = "";
    let total = 0;

    const filtered = allRecords.filter(record => {
        if (!month) return true;
        return record.date.startsWith(month);
    });

    filtered.forEach(record => {
        total += record.amount;

        const recordElement = document.createElement("div");
        recordElement.classList.add("record");

        recordElement.innerHTML = `
            <p><strong>日期：</strong>${record.date}</p>
            <p><strong>類別：</strong>${record.category}</p>
            <p><strong>金額：</strong>${record.amount} 元</p>
            <p><strong>備註：</strong>${record.note}</p>
            <button class="delete-btn">刪除</button>
        `;

        recordsContainer.appendChild(recordElement);
    });

    totalDisplay.textContent = `本月總支出：${total} 元`;
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const newRecord = {
        date: document.getElementById("date").value,
        category: document.getElementById("category").value,
        amount: Number(document.getElementById("amount").value),
        note: document.getElementById("note").value
    };

    if (!newRecord.date || !newRecord.category || newRecord.amount <= 0) {
        alert("請確認資料填寫正確（金額需大於 0）");
        return;
    }

    try {
        await fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify(newRecord),
            headers: { "Content-Type": "application/json" },
            mode: "no-cors"
        });

        form.reset();
        alert("記帳成功！（請到 Google Sheets 查看資料）");
        setTimeout(loadRecords, 2000);
    } catch (error) {
        console.error("新增紀錄失敗：", error);
    }
});

recordsContainer.addEventListener("click", async function (e) {
    if (e.target.classList.contains("delete-btn")) {
        const parent = e.target.closest(".record");

        const date = parent.querySelector("p:nth-child(1)").textContent.replace("日期：", "").trim();
        const category = parent.querySelector("p:nth-child(2)").textContent.replace("類別：", "").trim();
        const amount = parent.querySelector("p:nth-child(3)").textContent.replace("金額：", "").replace("元", "").trim();
        const note = parent.querySelector("p:nth-child(4)").textContent.replace("備註：", "").trim();

        if (confirm("確定要刪除這筆記錄嗎？")) {
            const deleteData = {
                action: "delete",
                date,
                category,
                amount: Number(amount),
                note
            };

            try {
                await fetch(apiUrl, {
                    method: "POST",
                    body: JSON.stringify(deleteData),
                    headers: { "Content-Type": "application/json" },
                    mode: "no-cors"
                });

                setTimeout(loadRecords, 2000);
            } catch (error) {
                console.error("刪除失敗：", error);
            }
        }
    }
});

monthFilter.addEventListener("change", renderRecords);
window.addEventListener("load", loadRecords);
