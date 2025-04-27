import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
        import { getDatabase, set, ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

        const firebaseConfig = {
            apiKey: "AIzaSyDloIOJSWp_5lVtoNBIE5XrdTJgbCpNGjo",
            authDomain: "test-655b0.firebaseapp.com",
            databaseURL: "https://test-655b0-default-rtdb.firebaseio.com",
            projectId: "test-655b0",
            storageBucket: "test-655b0.firebasestorage.app",
            messagingSenderId: "948260428804",
            appId: "1:948260428804:web:78f1ea2db14800c5b42951"
        };

        document.addEventListener("DOMContentLoaded", loadInventory);
        document.querySelector("#saveButton").addEventListener("click", saveData);
        document.querySelector("#backToOrdersBtn").addEventListener("click", function(){window.location.href = 'shop.html';});
       


        const app = initializeApp(firebaseConfig);
        const db = getDatabase();

        const inventoryRef = ref(db, "config/inventory");

        function loadInventory() {
            get(inventoryRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const inventory = snapshot.val();
                    const pita = inventory.pita;
                    const lafa = inventory.lafa;
                    const potato = inventory.potato;
                    const fries = inventory.fries;
                    const coke = inventory.coke;
                    const zero = inventory.zero;
                    const grape = inventory.grape;
                    const water = inventory.water;
                    const fuzeTea = inventory.fuzeTea;
                    const sprite = inventory.sprite;
                    const schweppes = inventory.schweppes;


                    document.getElementById('pita').value = pita;
                    document.getElementById('lafa').value = lafa;
                    document.getElementById('potato').value = potato;
                    document.getElementById('fries').value = fries;
                    document.getElementById('coke').value = coke;
                    document.getElementById('zero').value = zero;
                    document.getElementById('grape').value = grape;
                    document.getElementById('water').value = water;
                    document.getElementById('fuzeTea').value = fuzeTea;
                    document.getElementById('sprite').value = sprite;
                    document.getElementById('schweppes').value = schweppes;

                    
                }
            }).catch((error) => {
                console.error("Error loading shop status:", error);
            });
        }

        function saveData() {
            const pita = parseInt(document.getElementById('pita').value) || 0;
            const lafa = parseInt(document.getElementById('lafa').value) || 0;
            const potato = parseInt(document.getElementById('potato').value) || 0;
            const fries = parseInt(document.getElementById('fries').value) || 0;
            const coke = parseInt(document.getElementById('coke').value) || 0;
            const zero = parseInt(document.getElementById('zero').value) || 0;
            const grape = parseInt(document.getElementById('grape').value) || 0;
            const water = parseInt(document.getElementById('water').value) || 0;
            const fuzeTea = parseInt(document.getElementById('fuzeTea').value) || 0;
            const sprite = parseInt(document.getElementById('sprite').value) || 0;
            const schweppes = parseInt(document.getElementById('schweppes').value) || 0;

            const inventory = {
                lafa: lafa,
                pita: pita,
                coke: coke,
                fries: fries,
                potato: potato,
                zero: zero,
                grape: grape,
                water: water,
                fuzeTea: fuzeTea,
                schweppes: schweppes,
                sprite: sprite
            }; 

            set(ref(db, "config/inventory"), inventory);

            // set(ref(inventoryRef), inventory);
             
        }


        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', function () {
                this.value = this.value.replace(/[^0-9]/g, 0); // Allow only digits (0-9)
            });
        });
