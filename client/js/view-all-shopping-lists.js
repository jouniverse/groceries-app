async function fetchShoppingLists() {
  try {
    const response = await fetch(`${API_URL}/shopping-lists`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const shoppingLists = await response.json();
      displayShoppingLists(shoppingLists);
    } else if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "login.html";
    } else {
      throw new Error("Failed to fetch shopping lists");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to load shopping lists");
  }
}

function displayShoppingLists(shoppingLists) {
  const container = document.getElementById("shoppingLists");
  container.innerHTML = "";

  if (shoppingLists.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center">
        <p class="lead">No shopping lists found. Create one to get started!</p>
      </div>`;
    return;
  }

  shoppingLists.forEach((list) => {
    // Calculate total price
    const totalPrice =
      list.groceryItems?.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0) || 0;

    const card = document.createElement("div");
    card.className = "col-md-4 mb-4";
    card.innerHTML = `
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-3">${list.name}</h5>
          <p class="card-text mb-2">${list.address || "No address provided"}</p>
          <div class="item-count mb-3 d-flex justify-content-between align-items-center">
            <span class="badge">
              ${list.groceryItems?.length || 0} items
            </span>
            <span class="badge">
              $${totalPrice.toFixed(2)}
            </span>
          </div>
          <div class="mt-auto">
            <a href="view-shopping-list.html?id=${
              list._id
            }" class="btn btn-primary btn-sm me-2">
              View Items
            </a>
            <button class="btn btn-danger btn-sm" onclick="deleteShoppingList('${
              list._id
            }')">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

async function deleteShoppingList(id) {
  if (!confirm("Are you sure you want to delete this shopping list?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/shopping-lists/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      fetchShoppingLists(); // Refresh the list
    } else if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    } else {
      throw new Error("Failed to delete shopping list");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to delete shopping list");
  }
}

// Load shopping lists when page loads
document.addEventListener("DOMContentLoaded", fetchShoppingLists);
