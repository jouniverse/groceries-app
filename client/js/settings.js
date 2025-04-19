// Update username
document
  .getElementById("updateUsernameForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const newUsername = document.getElementById("newUsername").value;

    try {
      const response = await fetch(`${API_URL}/users/update-username`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ newUsername }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("username", newUsername);
        updateNavigation();
        alert("Username updated successfully!");
        document.getElementById("newUsername").value = "";
      } else {
        alert(data.error || "Failed to update username");
      }
    } catch (error) {
      alert("An error occurred while updating username");
    }
  });

// Change password
document
  .getElementById("changePasswordForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword =
      document.getElementById("confirmNewPassword").value;

    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/change-password`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password changed successfully!");
        document.getElementById("changePasswordForm").reset();
      } else {
        alert(data.error || "Failed to change password");
      }
    } catch (error) {
      alert("An error occurred while changing password");
    }
  });

// Delete account
document
  .getElementById("deleteAccountBtn")
  .addEventListener("click", async () => {
    const confirmation = confirm(
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
    );

    if (!confirmation) return;

    try {
      const response = await fetch(`${API_URL}/users/delete-account`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "index.html";
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete account");
      }
    } catch (error) {
      alert("An error occurred while deleting account");
    }
  });
