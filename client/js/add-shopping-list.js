document
  .getElementById("addShoppingListForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const address = document.getElementById("address").value;

    // console.log("Submitting shopping list:", { name, address });

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to create a shopping list");
        window.location.href = "login.html";
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      // console.log("Auth headers:", headers);

      const response = await fetch(`${API_URL}/shopping-lists`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ name, address }),
      });

      // console.log("Response status:", response.status);
      const data = await response.json();
      // console.log("Response data:", data);

      if (response.ok) {
        window.location.href = "view-all-shopping-lists.html";
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
      } else {
        alert(data.message || "Failed to add shopping list");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add shopping list. Check console for details.");
    }
  });
