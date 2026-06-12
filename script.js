const form = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const savingsEl = document.getElementById("savings");

const searchInput = document.getElementById("search");
const filterInput = document.getElementById("filter");
const sortInput = document.getElementById("sort");

const themeBtn = document.getElementById("themeToggle");
const exportBtn = document.getElementById("exportCSV");
const exportPDFBtn = document.getElementById("exportPDF");

const goalInput = document.getElementById("budgetGoal");
const saveGoalBtn = document.getElementById("saveGoal");

const progressBar = document.getElementById("progressBar");
const goalText = document.getElementById("goalText");

const toast = document.getElementById("toast");

const totalTransactionsEl =
document.getElementById("totalTransactions");

const highestExpenseEl =
document.getElementById("highestExpense");

const highestIncomeEl =
document.getElementById("highestIncome");

const recentActivity =
document.getElementById("recentActivity");

const categoryIcons = {

    Salary:"💰",
    Food:"🍔",
    Transport:"🚗",
    Shopping:"🛒",
    Bills:"💡",
    Entertainment:"🎬",
    Other:"📦"

};

let chart;

let transactions =
JSON.parse(
localStorage.getItem("transactions")
) || [];

let budgetGoal =
Number(
localStorage.getItem("budgetGoal")
) || 0;

goalInput.value = budgetGoal || "";

function showToast(message){

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}

function saveData(){

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}

function animateValue(element,value){

    let start = 0;

    let duration = 600;

    let increment =
    value / (duration / 10);

    let timer =
    setInterval(()=>{

        start += increment;

        if(start >= value){

            start = value;

            clearInterval(timer);

        }

        element.textContent =
        `₹${Math.round(start)}`;

    },10);

}

function updateBudgetGoal(totalExpense){

    if(budgetGoal <= 0){

        progressBar.style.width = "0%";

        goalText.textContent =
        "No Goal Set";

        return;

    }

    let percent = Math.min(

        (totalExpense / budgetGoal)
        * 100,

        100

    );

    progressBar.style.width =
    percent + "%";

    if(percent > 90){

        progressBar.style.background =
        "#ff5252";

    }
    else if(percent > 70){

        progressBar.style.background =
        "#ffc107";

    }
    else{

        progressBar.style.background =
        "#00e676";

    }

    goalText.textContent =
    `${percent.toFixed(1)}% of Budget Used`;

}

saveGoalBtn.addEventListener(
"click",
()=>{

    budgetGoal =
    Number(goalInput.value);

    localStorage.setItem(
        "budgetGoal",
        budgetGoal
    );

    updateUI();

    showToast(
        "Budget Goal Saved"
    );

});

function updateUI(){

    transactionList.innerHTML = "";

    let income = 0;
    let expense = 0;

    let search =
    searchInput.value.toLowerCase();

    let filter =
    filterInput.value;

    let filtered =
    transactions.filter(item=>{

        let matchesSearch =
        item.description
        .toLowerCase()
        .includes(search);

        let matchesFilter =
        filter === "all"
        || item.type === filter;

        return matchesSearch
        && matchesFilter;

    });

    if(sortInput.value==="high"){

        filtered.sort(
        (a,b)=>
        b.amount-a.amount
        );

    }

    if(sortInput.value==="low"){

        filtered.sort(
        (a,b)=>
        a.amount-b.amount
        );

    }

    if(sortInput.value==="oldest"){

        filtered.reverse();

    }

    if(filtered.length===0){

        transactionList.innerHTML = `

        <div class="empty-state">

        <h1>📊</h1>

        <h3>
        No Transactions Found
        </h3>

        <p>
        Add your first transaction
        </p>

        </div>

        `;

    }

    filtered.forEach((item,index)=>{

        const li =
        document.createElement("li");

        li.className =
        "transaction";

        li.innerHTML = `

        <div class="left">

        <strong>

        ${item.description}

        </strong>

        <span class="category">

        ${categoryIcons[item.category]}
        ${item.category}

        </span>

        <span class="category">

        ${item.date}

        </span>

        </div>

        <div class="
        ${item.type==="income"
        ? "amount-income"
        : "amount-expense"}">

        ${item.type==="income"
        ? "+"
        : "-"}

        ₹${item.amount}

        </div>

        <div class="actions">

        <button
        class="edit-btn"
        onclick="editTransaction(${index})">

        Edit

        </button>

        <button
        class="delete-btn"
        onclick="deleteTransaction(${index})">

        Delete

        </button>

        </div>

        `;

        transactionList.appendChild(li);

    });

        transactions.forEach(item=>{

        if(item.type==="income"){
            income += Number(item.amount);
        }else{
            expense += Number(item.amount);
        }

    });

    const balance = income - expense;

    animateValue(balanceEl,balance);
    animateValue(incomeEl,income);
    animateValue(expenseEl,expense);
    animateValue(savingsEl,balance);

    totalTransactionsEl.textContent =
    transactions.length;

    const expenses =
    transactions.filter(
    t=>t.type==="expense"
    );

    const incomes =
    transactions.filter(
    t=>t.type==="income"
    );

    highestExpenseEl.textContent =
    expenses.length
    ? Math.max(
    ...expenses.map(
    e=>Number(e.amount)
    ))
    : 0;

    highestIncomeEl.textContent =
    incomes.length
    ? Math.max(
    ...incomes.map(
    e=>Number(e.amount)
    ))
    : 0;

    updateBudgetGoal(expense);

    updateRecentActivity();

    updateChart();

}

function updateRecentActivity(){

    recentActivity.innerHTML = "";

    const latest =
    [...transactions]
    .reverse()
    .slice(0,5);

    if(latest.length===0){

        recentActivity.innerHTML =
        "No Recent Activity";

        return;

    }

    latest.forEach(item=>{

        const div =
        document.createElement("div");

        div.className =
        "activity-item";

        div.innerHTML = `

        ${item.type==="income"
        ? "🟢"
        : "🔴"}

        ${item.description}

        - ₹${item.amount}

        `;

        recentActivity
        .appendChild(div);

    });

}

function addTransaction(e){

    e.preventDefault();

    const description =
    document.getElementById(
    "description"
    ).value;

    const amount =
    document.getElementById(
    "amount"
    ).value;

    const type =
    document.getElementById(
    "type"
    ).value;

    const category =
    document.getElementById(
    "category"
    ).value;

    transactions.push({

        description,
        amount,
        type,
        category,

        date:
        new Date()
        .toLocaleString()

    });

    saveData();

    updateUI();

    form.reset();

    showToast(
    "Transaction Added"
    );

}

function deleteTransaction(index){

    if(
    !confirm(
    "Delete Transaction?"
    )
    ) return;

    transactions.splice(
    index,
    1
    );

    saveData();

    updateUI();

    showToast(
    "Transaction Deleted"
    );

}

function editTransaction(index){

    const item =
    transactions[index];

    const newDesc =
    prompt(
    "Edit Description",
    item.description
    );

    if(newDesc===null)
    return;

    const newAmount =
    prompt(
    "Edit Amount",
    item.amount
    );

    if(newAmount===null)
    return;

    item.description =
    newDesc;

    item.amount =
    newAmount;

    saveData();

    updateUI();

    showToast(
    "Transaction Updated"
    );

}

function exportCSV(){

    let csv =
    "Description,Amount,Type,Category,Date\n";

    transactions.forEach(item=>{

        csv +=
        `${item.description},
${item.amount},
${item.type},
${item.category},
${item.date}\n`;

    });

    const blob =
    new Blob(
    [csv],
    {
    type:"text/csv"
    });

    const url =
    URL.createObjectURL(
    blob
    );

    const a =
    document.createElement("a");

    a.href = url;

    a.download =
    "transactions.csv";

    a.click();

    showToast(
    "CSV Exported"
    );

}

function exportPDF(){

    const { jsPDF } =
    window.jspdf;

    const doc =
    new jsPDF();

    doc.setFontSize(18);

    doc.text(
    "Budget Tracker Report",
    20,
    20
    );

    let y = 40;

    transactions.forEach(item=>{

        doc.text(

        `${item.description}
 - ₹${item.amount}
 (${item.category})`,

        20,
        y

        );

        y += 10;

    });

    doc.save(
    "budget-report.pdf"
    );

    showToast(
    "PDF Exported"
    );

}

function updateChart(){

    const categories = {};

    transactions.forEach(item=>{

        if(
        item.type==="expense"
        ){

            categories[
            item.category
            ] =

            (categories[
            item.category
            ] || 0)

            +

            Number(
            item.amount
            );

        }

    });

    const labels =
    Object.keys(
    categories
    );

    const values =
    Object.values(
    categories
    );

    const ctx =
    document.getElementById(
    "expenseChart"
    );

    if(chart){

        chart.destroy();

    }

    chart =
    new Chart(ctx,{

        type:"doughnut",

        data:{

            labels,

            datasets:[{

                data:values

            }]

        },

        options:{

            responsive:true,

            cutout:"70%",

            plugins:{

                legend:{

                    position:"bottom",

                    labels:{
                        color:"#fff"
                    }

                }

            }

        }

    });

}

searchInput.addEventListener(
"input",
updateUI
);

filterInput.addEventListener(
"change",
updateUI
);

sortInput.addEventListener(
"change",
updateUI
);

form.addEventListener(
"submit",
addTransaction
);

exportBtn.addEventListener(
"click",
exportCSV
);

exportPDFBtn.addEventListener(
"click",
exportPDF
);

themeBtn.addEventListener(
"click",
()=>{

    document.body
    .classList
    .toggle("dark");

    localStorage.setItem(

    "theme",

    document.body
    .classList
    .contains("dark")

    ? "dark"

    : "light"

    );

});

if(
localStorage.getItem(
"theme"
)==="dark"
){

    document.body
    .classList
    .add("dark");

}

updateUI();