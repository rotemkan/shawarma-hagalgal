import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, get, ref, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDloIOJSWp_5lVtoNBIE5XrdTJgbCpNGjo",
    authDomain: "test-655b0.firebaseapp.com",
    databaseURL: "https://test-655b0-default-rtdb.firebaseio.com",
    projectId: "test-655b0",
    storageBucket: "test-655b0.firebasestorage.app",
    messagingSenderId: "948260428804",
    appId: "1:948260428804:web:78f1ea2db14800c5b42951"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const markedRows = new Map();

const toggleButton = document.getElementById('shopStatusBtn');
const configRef = ref(db, "config/");
const ordersTable = document.querySelector("#ordersTable tbody");
const previousOrdersTable = document.querySelector("#previousOrdersTable tbody");
const ordersRef = ref(db, "Orders/");
const PreviousOrders = ref(db, "PreviousOrders/");

document.querySelector("#deleteOrdersBtn").addEventListener("click", deleteOrders);
// document.querySelector("#inventoryBtn").addEventListener("click", function(){ window.location.href = 'inventory.html';});
document.querySelector("#clearDbBtn").addEventListener("click", clearOrders);
document.querySelector("#sendToDeliveriesBtn").addEventListener("click", sendToDeliveries);
document.querySelector("#shopStatusBtn").addEventListener("click", function(){toggleShopStatus(true);});
document.querySelector("#closeDayBtn").addEventListener("click", loadClosingDay); 
document.querySelector("#backBtn").addEventListener("click", backToOrders);
document.querySelector("#clearPrevOrdersBtn").addEventListener("click", clearPreviousOrders);

document.addEventListener("DOMContentLoaded", loadOrders);
document.addEventListener("DOMContentLoaded", function(){toggleShopStatus(false);});

function addAllOrdersToMap() {
    markedRows.clear();
    const tableRows = document.querySelectorAll("#ordersTable tbody tr"); // Select all rows in the tbody

    tableRows.forEach((row, index) => {
        const id = row.dataset.id;
        const cells = row.querySelectorAll("td"); // Get all cells in the current row

        const optionsString = cells[2]?.textContent || ""; // Get the options as a string
        const options = optionsString.split(",").map(option => option.trim()); // Split and trim whitespace

        const order = {
            name: cells[0]?.textContent || "",
            phone: cells[1]?.textContent || "",
            options: options,
            additions: cells[3]?.textContent || "",
            drinks: cells[4]?.textContent || "",
            address: cells[5]?.textContent || "",
            dishComments: cells[6]?.textContent || "",
            price: parseInt(cells[7]?.textContent || "0", 0),    // Price
            paymentMethod: cells[8]?.textContent || ""
        };
        markedRows.set(id, [order, "markedDummy"]);
        console.log(`Order ${index + 1}:`, order);
    });
}

function closeDay(){
    // const ordersTable1 = document.querySelector("#ordersTable tbody");
    // const rows = ordersTable1.querySelectorAll("tr");
    // if(rows.size != 0){
    //     var userResponse = confirm("יש הזמנות שלא ניקית מהמסך הראשי. להוסיף אותן למסך הסיכום?");
    //     if(userResponse){
    //         clearOrders();
    //     }
    // }
   
    document.getElementById('customer-orders-page').style.display = 'none';
    document.getElementById('customer-orders-floating-buttons').style.display = 'none';
    document.getElementById('close-day-page').style.display = 'block'
    document.getElementById('close-day-floating-buttons').style.display = 'block';            
}

function backToOrders(){
    document.getElementById('customer-orders-page').style.display = 'block';
    document.getElementById('customer-orders-floating-buttons').style.display = 'block';
    document.getElementById('close-day-page').style.display = 'none'
    document.getElementById('close-day-floating-buttons').style.display = 'none';            
}

function clearOrders() {
    var userResponse = true;
    if(markedRows.size == 0){
        userResponse = confirm("שים לב! פעולה זו תמחק את כל ההזמנות הקיימות. האם אתה בטוח?");
        if(userResponse){
            addAllOrdersToMap();
        }
    }
    else{
        userResponse = confirm("למחוק את כל ההזמנות המסומנות?");
    }
    if (userResponse) {
    const deletePromises = Array.from(markedRows).map((order) => {
        order[1][0].handledTime = getCurrentTime();
        set(ref(db, `Orders/${order[0]}`), null);
        set(ref(db, `PreviousOrders/${order[0]}`), order[1][0]);
    });
    Promise.all(deletePromises)
        .then(() => {
            markedRows.clear();
            loadOrders();
        })
        .catch(error => {
            console.error("Error deleting marked orders:", error);
            alert("An error occurred while deleting marked orders.");
        });
    
    }
}

function deleteOrders() {
    var userResponse = confirm("מחיקת כל ההזמנות המסומנות?");
    if (userResponse) {              
        const deletePromises = Array.from(markedRows).map((order) => {
            set(ref(db, `Orders/${order[0]}`), null);
        });
        Promise.all(deletePromises)
            .then(() => {
                markedRows.clear();
                loadOrders();
            })
            .catch(error => {
                console.error("Error deleting marked orders:", error);
                alert("An error occurred while deleting marked orders.");
            });
        
    }
}

function sendToDeliveries() {
    var userResponse = confirm("שליחת כל ההזמנות המסומנות למסך משלוחים?");
    if (userResponse) {
        let address = prompt("נא לעדכן כתובת למשלוח");
        let shouldUpdateAddress = true;
        if (address == null || address.trim() == "") {
            const noAddressResponse = confirm("להזין משלוח ללא כתובת");
            if(!noAddressResponse){
                return;
            }
            shouldUpdateAddress = false;
        }
        // Trim the response to a maximum of 35 characters
        address = address.trim(); // Remove extra spaces
        if (address.length > 35) {
            address = address.substring(0, 35); // Keep only the first 35 characters
        }
        
        
        const deletePromises = Array.from(markedRows).map((order) => {
            if(shouldUpdateAddress){
                order[1][0].address = address;
            }
            order[1][0].handledTime = getCurrentTime();
            set(ref(db, `Orders/${order[0]}`), null);
            set(ref(db, `Deliveries/${order[0]}`), order[1][0]);
        });
        Promise.all(deletePromises)
            .then(() => {
                markedRows.clear();
                loadOrders();
            })
            .catch(error => {
                console.error("Error deleting marked orders:", error);
                alert("An error occurred while deleting marked orders.");
            });
        
    }
}

async function clearPreviousOrders(){
    var userResponse = confirm("שים לב! פעולה זו תמחק את כל ההזמנות השמורות. האם אתה בטוח?");
    if(userResponse){
        await set(ref(db, `PreviousOrders/`), null);
        loadClosingDay();
    }
   
    
}

function toggleShopStatus(changeStatus = false) {
    get(configRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                const config = snapshot.val();
                var isShopOpen = config.is_shop_open
                if(changeStatus == true){
                    set(ref(db, "config/is_shop_open"), !config.is_shop_open);
                    isShopOpen = !config.is_shop_open;
                }
                if(isShopOpen){
                    toggleButton.textContent = "הדוכן פתוח";
                    toggleButton.style.backgroundColor = "green";
                }
                else{
                    toggleButton.textContent = "הדוכן סגור";
                    toggleButton.style.backgroundColor = "red";
                }
            }
        })
        .catch(error => {
            console.error("Error toggling shop status:", error);
        });
}

class RotatingColorMarker{
    constructor(){
        this.numberOfColors = 2;
        this.index = 0;
        this.markingColors = ["markedGreen", "markedRed"]
    }

    nextColor(){
        if(this.index == (this.numberOfColors -1)){
            this.index = 0;
        }
        else{
            this.index++;
        }
    }

    previousColor(){
        if(this.index == 0){
            this.index = (this.numberOfColors -1);
        }
        else{
            this.index--;
        }
    }

    preserveColor(currentColor){
        let index = this.markingColors.indexOf(currentColor);
        if( index == -1){
            index = 0;
        }
        this.index = index;
    }

    getColor(){
        return this.markingColors[this.index];
    }
}

function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}


let rcm = new RotatingColorMarker();
function loadOrders() {
    let activeOrdersCount = 0;
    get(ordersRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                ordersTable.innerHTML = "";
                const data = snapshot.val();
                Object.entries(data).forEach(([id, order]) => {
                    activeOrdersCount++;
                    const row = document.createElement("tr");
                    row.dataset.id = id;
                    
                    row.addEventListener("click", function () {
                        if (markedRows.has(id)) {
                            rcm.preserveColor(markedRows.get(id)[1]);
                            row.classList.remove(markedRows.get(id)[1]);
                            markedRows.delete(id);

                        } else {
                            markedRows.set(id, [order,rcm.getColor()]);
                            row.classList.add(rcm.getColor());
                            rcm.nextColor();

                        }
                    });

                    row.addEventListener("dblclick", function () {
                        if (markedRows.has(id)) {
                            rcm.preserveColor(markedRows.get(id)[1]);
                            markedRows.delete(id);
                        }
                        order.handledTime = getCurrentTime();
                        set(ref(db, `Orders/${id}`), null);
                        if(order.address.trim() !== ''){
                            set(ref(db, `Deliveries/${id}`), order);
                        }
                        else{
                            set(ref(db, `PreviousOrders/${id}`), order);
                        }
                        
                        loadOrders();;
                    });

                    if (markedRows.has(id)) row.classList.add(markedRows.get(id)[1]);

                    row.innerHTML = `
                        <td>${order.name}</td>
                        <td>${order.phone}</td>
                        <td><span style="font-weight: bold;">${order.options.join(", ")}</td>
                        <td>${order.additions}</td>
                        <td>${order.drinks}</td>
                        <td>${order.address}</td>
                        <td><span style="color: red;font-weight: bold;">${order.dishComments}</span></td>
                        <td>${order.price || "N/A"}</td>
                        <td>${order.paymentMethod}</td>
                    `;
                    ordersTable.appendChild(row);
                });
            } else {
                ordersTable.innerHTML = "";
            }
            document.getElementById('activeOrdersCount').textContent = activeOrdersCount; 
        })
        .catch(error => {
            console.error("Error loading orders:", error);
            ordersTable.innerHTML = '<tr><td colspan="5">שגיאה בטעינת ההזמנות</td></tr>';
        });
}

function loadClosingDay() {
    closeDay();
    let numberOfOrders = 0;
    let overallHandlingSeconds = 0;
    get(PreviousOrders)
        .then(snapshot => {
            if (snapshot.exists()) {
                previousOrdersTable.innerHTML = "";
                const data = snapshot.val();
                let OverallIncome = 0;
                let shippingSet = new Set();
                Object.entries(data).forEach(([id, order]) => {
                    const row = document.createElement("tr");
                    if(order.address.trim() !== ''){
                        let shippingItemString = order.address + '.' + order.name + '.' + order.phone;
                        shippingSet.add(shippingItemString);
                    }

                    const {deltaTimeInSeconds, formattedDeltaTime} = calculateDeltaTime(order.handledTime, order.orderTime);
                    numberOfOrders ++;
                    overallHandlingSeconds += deltaTimeInSeconds
                    row.innerHTML = `
                        <td>${order.name}</td>
                        <td>${order.phone}</td>
                        <td>${order.options.join(", ")}</td>
                        <td>${order.additions}</td>
                        <td>${order.drinks}</td>
                        <td>${order.address}</td>
                        <td>${order.dishComments}</td>
                        <td>${order.price || "N/A"}</td>
                        <td>${order.paymentMethod}</td>
                        <td>${order.orderTime}</td>
                        <td>${order.handledTime}</td>
                        <td>${formattedDeltaTime}</td>

                    `;
                    OverallIncome += order.price;
                    previousOrdersTable.appendChild(row);
                });

                const calculateAverageHandlingTime = (overallHandlingSeconds, numberOfOrders) => {
                    const averageDeltaSeconds = overallHandlingSeconds / numberOfOrders;
                    // Convert average seconds to MM:SS
                    const averageMinutes = Math.floor(averageDeltaSeconds / 60);
                    const averageSeconds = Math.round(averageDeltaSeconds % 60); // Round to handle fractions
                    return `${averageMinutes}:${String(averageSeconds).padStart(2, '0')}`;
                };

                const averageOrderHandlingTimeInSeconds = calculateAverageHandlingTime(overallHandlingSeconds,numberOfOrders);
                const shippingPrice = 5;
                const totalShippingIncome = (shippingPrice * shippingSet.size)
                document.getElementById('orderCount').textContent = numberOfOrders;
                document.getElementById('totalPrice').textContent = OverallIncome;
                document.getElementById('totalShipmentsIncome').textContent = totalShippingIncome;
                document.getElementById('averageOrderHadnlingTime').textContent = averageOrderHandlingTimeInSeconds;


            } else {
                previousOrdersTable.innerHTML = "";
            }
        })
        .catch(error => {
            console.error("Error loading orders:", error);
            previousOrdersTable.innerHTML = '<tr><td colspan="5">Error loading orders</td></tr>';
        });
}

function exportTableToExcel(filename) {
    // Get the table element
    const table = document.getElementById("previousOrdersTable");

    // Create a workbook and a worksheet
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.table_to_sheet(table);
    ws['!rtl'] = true;

    // Add two rows directly under the table
    const range = XLSX.utils.decode_range(ws['!ref']);
    const lastRow = range.e.r + 1; // Next row index

    // Adjust column widths if needed
    ws['!cols'] = Array.from({ length: range.e.c + 1 }, () => ({ width: 15 })); // Adjust width for all columns

  
    const orderCount = parseInt(document.getElementById("orderCount").textContent, 10);
    const overallIncome = parseInt(document.getElementById("totalPrice").textContent, 10);
    const totalShippingIncome = parseInt(document.getElementById("totalShipmentsIncome").textContent, 10);
    const averageOrderHadnlingTime = document.getElementById("averageOrderHadnlingTime").textContent.trim();

    
    ws[XLSX.utils.encode_cell({ r: lastRow, c: 0 })] = { t: "s", v: "כמות הזמנות:" }; // First column
    ws[XLSX.utils.encode_cell({ r: lastRow, c: 1 })] = { t: "n", v: orderCount };    // Second column

    ws[XLSX.utils.encode_cell({ r: lastRow +1, c: 0 })] = { t: "s", v: "סהכ הכנסות:" }; // First column
    ws[XLSX.utils.encode_cell({ r: lastRow +1, c: 1 })] = { t: "n", v: overallIncome };    // Second column

    // Add the second row ("sum2:", 24)
    ws[XLSX.utils.encode_cell({ r: lastRow + 2, c: 0 })] = { t: "s", v: "סהכ הכנסות ממשלוחים:" }; // First column
    ws[XLSX.utils.encode_cell({ r: lastRow + 2, c: 1 })] = { t: "n", v: totalShippingIncome };     // Second column

    ws[XLSX.utils.encode_cell({ r: lastRow + 3, c: 0 })] = { t: "s", v: "זמן טיפול ממוצע במנה:" }; // First column
    ws[XLSX.utils.encode_cell({ r: lastRow + 3, c: 1 })] = { t: "s", v: averageOrderHadnlingTime };     // Second column

    // Update the range to include new rows
    range.e.r += 4;
    ws['!ref'] = XLSX.utils.encode_range(range);

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Export the workbook to a file
    XLSX.writeFile(wb, filename);
}

// Attach the export function to a button
document.getElementById("exportToExcelBtn").addEventListener("click", () => {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const filename = `סגירת יום-${today}.xlsx`; // Filename with today's date
    exportTableToExcel(filename);
});

function calculateDeltaTime(time1, time2) {
    // Convert HH:MM:SS to total seconds
    const timeToSeconds = (time) => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    const seconds1 = timeToSeconds(time1);
    const seconds2 = timeToSeconds(time2);

    // Calculate the absolute difference in seconds
    const deltaTimeInSeconds = Math.abs(seconds1 - seconds2);

    // Convert delta seconds to minutes and seconds
    const minutes = Math.floor(deltaTimeInSeconds / 60);
    const seconds = deltaTimeInSeconds % 60;

    // Format as MM:SS
    return {
        deltaTimeInSeconds,
        formattedDeltaTime: `${minutes}:${String(seconds).padStart(2, '0')}`,
    };
}

document.getElementById('customer-orders-page').style.display = 'block';
document.getElementById('close-day-page').style.display = 'none';

setInterval(loadOrders, 2000);
