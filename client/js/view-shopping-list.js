const shoppingListTitleHeading = document.querySelector(
  "#shoppingListTitleHeading"
);
const groceryItemsUL = document.querySelector("#groceryItemsUL");
let shoppingListId = "";

document.addEventListener("DOMContentLoaded", (e) => {
  const urlParams = new URLSearchParams(window.location.search);
  shoppingListId = urlParams.get("id");
  if (!shoppingListId) {
    window.location.href = "view-all-shopping-lists.html";
    return;
  }
  populateShoppingList(shoppingListId);
});

async function deleteGroceryItem(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/grocery-items/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    const data = await response.json();
    if (data.success) {
      window.location.href = `view-shopping-list.html?id=${shoppingListId}`;
    }
  } catch (error) {
    console.error("Error deleting grocery item:", error);
    alert("Failed to delete grocery item");
  }
}

async function populateShoppingList(shoppingListId) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/shopping-lists/${shoppingListId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    const shoppingList = await response.json();

    // Calculate total price
    const totalPrice =
      shoppingList.groceryItems?.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0) || 0;

    shoppingListTitleHeading.innerHTML = `${
      shoppingList.name
    } <span class="total-price">Total: $${totalPrice.toFixed(2)}</span>`;

    if (!shoppingList.groceryItems || shoppingList.groceryItems.length === 0) {
      groceryItemsUL.innerHTML = `
        <div class="alert alert-primary" role="alert">
          No grocery items found!
        </div>
      `;
      return;
    }

    const groceryItemsLI = shoppingList.groceryItems.map((groceryItem) => {
      const itemTotal = groceryItem.price * groceryItem.quantity;
      return `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <span class="item-name">${groceryItem.name}</span>
            <span class="item-details">$${groceryItem.price} × ${
        groceryItem.quantity
      }</span>
          </div>
          <div class="d-flex align-items-center">
            <span class="item-total me-3">$${itemTotal.toFixed(2)}</span>
            <button onclick="deleteGroceryItem('${
              groceryItem._id
            }')" class="btn btn-danger btn-sm">
              Delete
            </button>
          </div>
        </li>
      `;
    });

    groceryItemsUL.innerHTML = groceryItemsLI.join("");
  } catch (error) {
    console.error("Error fetching shopping list:", error);
    alert("Failed to load shopping list");
  }
}
