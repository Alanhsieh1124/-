const apiUrl = "https://script.google.com/a/macros/stu.tcssh.tc.edu.tw/s/AKfycbyvOaWbj8bN8lo69e_sl9miFbdmjFvdYEyUfNG5jobN/dev";

const form = document.getElementById("recordForm");
const recordsContainer = document.getElementById("records");
const monthFilter = document.getElementById("monthFilter");
const totalDisplay = document.getElementById("total");

let allRecords = [];

async function loadRecords() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        allRecords = data.slice(1).map((record, i) => ({
            id: i + 1,
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
            <button class="delete-btn" data-id="${record.id}">刪除</button>
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

    await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify(newRecord),
        headers: { "Content-Type": "application/json" },
        mode: "no-cors"
    });

    form.reset();
    alert("記帳成功！（請到 Google Sheets 查看資料）");
    setTimeout(loadRecords, 2000);
});

recordsContainer.addEventListener("click", async function (e) {
    if (e.target.classList.contains("delete-btn")) {
        const id = e.target.getAttribute("data-id");
        if (confirm("確定要刪除這筆記錄嗎？")) {
            await fetch(apiUrl, {
                method: "POST",
                body: JSON.stringify({ action: "delete", id }),
                headers: { "Content-Type": "application/json" },
                mode: "no-cors"
            });
            setTimeout(loadRecords, 2000);
        }
    }
});

monthFilter.addEventListener("change", renderRecords);
window.addEventListener("load", loadRecords);
