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

        const ordersTable = document.querySelector("#ordersTable tbody");
        const deliveriesRef = ref(db, "Deliveries/");
        const PreviousOrders = ref(db, "PreviousOrders/");

        document.querySelector("#orderDeliveredBtn").addEventListener("click", orderDelivered);

        document.addEventListener("DOMContentLoaded", loadOrders);

        function orderDelivered() {            
            const userResponse = confirm("למחוק את כל ההזמנות המסומנות?");
            
            if (userResponse) {
            const deletePromises = Array.from(markedRows).map((order) => {
                set(ref(db, `Deliveries/${order[0]}`), null);
                set(ref(db, `PreviousOrders/${order[0]}`), order[1]);
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

        function loadOrders() {
            get(deliveriesRef)
                .then(snapshot => {
                    if (snapshot.exists()) {
                        ordersTable.innerHTML = "";
                        const data = snapshot.val();
                        Object.entries(data).forEach(([id, order]) => {
                            const row = document.createElement("tr");
                            row.dataset.id = id;
                            
                            row.addEventListener("click", function () {
                                if (markedRows.has(id)) {
                                    markedRows.delete(id);
                                    row.classList.remove("marked");
                                } else {
                                    markedRows.set(id, order);
                                    row.classList.add("marked");
                                }
                            });

                            // row.addEventListener("dblclick", function () {
                            //     if (markedRows.has(id)) {
                            //         markedRows.delete(id);
                            //     }

                            //     set(ref(db, `Deliveries/${id}`), null);
                            //     set(ref(db, `PreviousOrders/${id}`), order);
                                
                            //     loadOrders();;
                            // });

                            if (markedRows.has(id)) row.classList.add("marked");

                            row.innerHTML = `
                                <td>${order.name}</td>
                                <td>${order.phone}</td>
                                <td>${order.wrapping}</td>
                                <td>${order.options.join(", ")}</td>
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
                })
                .catch(error => {
                    console.error("Error loading orders:", error);
                    ordersTable.innerHTML = '<tr><td colspan="5">שגיאה בטעינת ההזמנות</td></tr>';
                });
        }


        setInterval(loadOrders, 5000);