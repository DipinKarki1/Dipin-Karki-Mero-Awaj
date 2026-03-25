export const getTicketById = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/v1/issues/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      return { success: true, ticket: data.data };
    }
    return { success: false, message: data.message };
  } catch (err) {
    return { success: false, message: "Failed to fetch ticket details" };
  }
};
