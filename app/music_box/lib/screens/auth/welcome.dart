import 'package:flutter/material.dart';
import 'package:music_box/screens/auth/signup-flow/email.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Column(
        children: [
          Expanded(
            child: Center(
              child: Text(
                "MusicBox",
                style: Theme.of(context).textTheme.headlineLarge,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 8.0, right: 8.0),
            child: ElevatedButton(
              onPressed: () => {},
              style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(60.0)),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Image(
                    height: 30,
                    image: AssetImage("assets/g-logo.png"),
                  ),
                  SizedBox(
                    width: 8.0,
                  ),
                  Text("Continue with Google")
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(top: 8.0, left: 8.0, right: 8.0),
            child: ElevatedButton(
                onPressed: () => {},
                style: ElevatedButton.styleFrom(
                    minimumSize: const Size.fromHeight(60.0)),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.email),
                    SizedBox(
                      width: 8.0,
                    ),
                    Text("Continue with email")
                  ],
                )),
          ),
          Padding(
            padding: const EdgeInsets.only(
                top: 8.0, left: 8.0, right: 8.0, bottom: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text("Don't have an account?"),
                TextButton(
                    onPressed: () => {
                          Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (context) =>
                                      const SignUpEmailScreen()))
                        },
                    child: const Text("Sign Up"))
              ],
            ),
          ),
        ],
      ),
    );
  }
}
