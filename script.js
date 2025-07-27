const supabaseUrl = "https://rktrdjnqbatijoozvuae.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdHJkam5xYmF0aWpvb3p2dWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODQ0NTYsImV4cCI6MjA2OTE2MDQ1Nn0.EGpWSvoyB2GXZaZfUZDtiEzhmQk4LtCY5VqE6cmUEfI";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Auth functions
async function login(e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    document.getElementById("error").textContent = error.message;
  } else {
    window.location.href = "index.html";
  }
}

async function signup() {
  const email = prompt("Email?");
  const password = prompt("Password?");
  const { error } = await supabaseClient.auth.signUp({ email, password });
  if (error) alert(error.message);
  else alert("Signup successful! Check your email.");
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

// Dashboard logic
window.onload = async () => {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    const onLoginPage = location.pathname.includes("login.html");
    if (!onLoginPage) location.href = "login.html";
    return;
  }

  const user = session.user;
  const welcome = document.getElementById("welcome");
  if (welcome) welcome.textContent = "Logged in as: " + user.email;

  loadMessages();
};

async function submitMessage(e) {
  e.preventDefault();
  const input = document.getElementById("message");
  const text = input.value.trim();
  if (!text) return;

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  const { error } = await supabaseClient.from("messages").insert({
    content: text,
    user_id: user.id,
  });

  if (error) alert("Error: " + error.message);
  input.value = "";
  loadMessages();
}

async function loadMessages() {
  const list = document.getElementById("messages");
  if (!list) return;

  const { data, error } = await supabaseClient
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    list.innerHTML = "<li>Error loading messages</li>";
    return;
  }

  list.innerHTML = data
    .map((msg) => `<li>${msg.content} <small>${msg.created_at}</small></li>`)
    .join("");
}
