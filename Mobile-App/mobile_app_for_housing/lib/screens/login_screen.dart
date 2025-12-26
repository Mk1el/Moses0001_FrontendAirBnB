import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:mobile_app_for_housing/utils/token_storage.dart';
import '../utils/jwt_utils.dart';
import 'home_admin.dart';
import 'home_host.dart';
import 'home_guest.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  bool loading = false;

  Future<void> login() async{
    setState(()=> loading = true);
    try{
      final response = await http.post(
        Uri.parse("http://192.168.100.29:8000/api/auth/login"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "email": emailController.text.trim(),
          "password": passwordController.text.trim(),
        }),
      );
      setState(()=> loading = false);
      if(response.statusCode == 200){
        final data = jsonDecode(response.body);
        final token = data["accessToken"];

        if(token == null){
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("No token returned from server")),
          );
          return;
        }
        final decoded = JwtUtils.getUserFromToken(token);
        print("DECODED TOKEN: $decoded");
        final role = decoded?["role"];

        if(role == null){
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("No role found in token")),
          );
          return;
        }
        await TokenStorage.saveAuthData(token, role);
        navigateBasedOnRole(context, role);
      }else{
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Login failed: ${response.body}")),
        );
      }
    }
    catch(e){
      setState(()=> loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Login error: $e")),
      );
    }
  }

  void navigateBasedOnRole(BuildContext context, String role) {
    switch (role) {
      case "ADMIN":
        Navigator.pushReplacement(
            context, MaterialPageRoute(builder: (_) => const AdminHome()));
        break;
      case "HOST":
        Navigator.pushReplacement(
            context, MaterialPageRoute(builder: (_) => const HostHome()));
        break;
      case "GUEST":
      default:
        Navigator.pushReplacement(
            context, MaterialPageRoute(builder: (_) => const GuestHome()));
        break;
    }
  }

  Widget googleButton() {
    return InkWell(
      onTap: () {
        // TODO: connect your Google auth here
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Google login not yet implemented")));
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        width: double.infinity,
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.network(
              "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png",
              height: 22,
            ),
            const SizedBox(width: 10),
            const Text("Continue with Google", style: TextStyle(fontSize: 16)),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],

      body: Center(
        child: SingleChildScrollView(
          child: Container(
            padding: const EdgeInsets.all(24),
            width: 360,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                    blurRadius: 25,
                    spreadRadius: 2,
                    color: Colors.black.withOpacity(0.1))
              ],
            ),

            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Center(
                  child: Text(
                    "Login",
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

                const SizedBox(height: 30),

                TextField(
                  controller: emailController,
                  decoration: InputDecoration(
                    labelText: "Email",
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8)),
                  ),
                ),

                const SizedBox(height: 18),

                TextField(
                  controller: passwordController,
                  obscureText: true,
                  decoration: InputDecoration(
                    labelText: "Password",
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8)),
                  ),
                ),

                const SizedBox(height: 12),

                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {
                      // TODO: navigate to forgot password
                    },
                    child: const Text(
                      "Forgot password?",
                      style: TextStyle(color: Colors.orange),
                    ),
                  ),
                ),

                const SizedBox(height: 10),

                loading
                    ? const Center(child: CircularProgressIndicator())
                    : SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: login,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue.shade600,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: const Text(
                            "Login",
                            style: TextStyle(fontSize: 17, color: Colors.white),
                          ),
                        ),
                      ),

                const SizedBox(height: 20),

                const Center(child: Text("OR")),

                const SizedBox(height: 20),

                googleButton(),

                const SizedBox(height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("New user? "),
                    GestureDetector(
                      onTap: () {
                        // TODO: navigate to register page
                      },
                      child: const Text(
                        "Create an Account",
                        style: TextStyle(
                            color: Colors.blue,
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
