const shoppingListDropDownMenu = document.getElementById(
  "shoppingListDropDownMenu"
);
const shoppingListDropDownButton = document.getElementById(
  "shoppingListDropDownButton"
);
const nameTextBox = document.getElementById("nameTextBox");
const priceTextBox = document.getElementById("priceTextBox");
const quantityTextBox = document.getElementById("quantityTextBox");
const saveGroceryItemButton = document.getElementById("saveGroceryItem");
let selectedShoppingListId = "";

document.addEventListener("DOMContentLoaded", (event) => {
  populateShoppingListsInDropDownList();

  // Add form submission handler
  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to add grocery items");
      window.location.href = "login.html";
      return;
    }

    if (!selectedShoppingListId) {
      alert("Please select a shopping list");
      return;
    }

    const name = nameTextBox.value;
    const price = parseFloat(priceTextBox.value);
    const quantity = parseInt(quantityTextBox.value);

    if (!name || isNaN(price) || isNaN(quantity)) {
      alert("Please fill in all fields with valid values");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/grocery-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          price,
          quantity,
          shoppingListId: selectedShoppingListId,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
      }

      const data = await response.json();

      if (response.ok) {
        window.location.href = "view-all-shopping-lists.html";
      } else {
        alert(data.message || "Failed to add grocery item");
      }
    } catch (error) {
      console.error("Error adding grocery item:", error);
      alert("Failed to add grocery item. Please try again.");
    }
  });
});

function selectShoppingList(shoppingListId, name) {
  shoppingListDropDownButton.textContent = name;
  selectedShoppingListId = shoppingListId;
}

function populateShoppingListsInDropDownList() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to add grocery items");
    window.location.href = "login.html";
    return;
  }

  fetch(`${API_URL}/shopping-lists`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
      }
      return response.json();
    })
    .then((shoppingLists) => {
      if (!Array.isArray(shoppingLists)) {
        console.error(
          "Expected an array of shopping lists, got:",
          shoppingLists
        );
        return;
      }

      // Clear existing dropdown items
      shoppingListDropDownMenu.innerHTML = "";

      // Create and append dropdown items
      shoppingLists.forEach((shoppingList) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.className = "dropdown-item";
        a.href = "#";
        a.textContent = shoppingList.name;

        // Add click event listener
        a.addEventListener("click", (e) => {
          e.preventDefault();
          selectShoppingList(shoppingList._id, shoppingList.name);
        });

        li.appendChild(a);
        shoppingListDropDownMenu.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Error fetching shopping lists:", error);
      alert("Failed to load shopping lists. Please try again.");
    });
}
