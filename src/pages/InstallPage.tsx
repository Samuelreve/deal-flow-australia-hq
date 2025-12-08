import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Share, PlusSquare, Smartphone, ArrowLeft, Check } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const InstallPage = () => {
  const navigate = useNavigate();
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      // Optionally redirect after install
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="container max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 mb-4">
              <Smartphone className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Install Trustroom.ai</h1>
            <p className="text-muted-foreground">
              Get the full app experience on your device
            </p>
          </div>

          {isInstalled ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-primary/20 p-3">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Already Installed!</h3>
                  <p className="text-sm text-muted-foreground">
                    Trustroom.ai is installed on your device. Open it from your home screen.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : isInstallable ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  One-Tap Install
                </CardTitle>
                <CardDescription>
                  Click below to add Trustroom.ai to your home screen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-purple-600 text-white"
                  onClick={handleInstall}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Install App
                </Button>
              </CardContent>
            </Card>
          ) : isIOS ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share className="h-5 w-5 text-primary" />
                  Install on iPhone/iPad
                </CardTitle>
                <CardDescription>
                  Follow these steps to add Trustroom.ai to your home screen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Tap the Share button</p>
                    <p className="text-sm text-muted-foreground">
                      Look for the <Share className="inline h-4 w-4" /> icon at the bottom of Safari
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Scroll down and tap "Add to Home Screen"</p>
                    <p className="text-sm text-muted-foreground">
                      <PlusSquare className="inline h-4 w-4" /> You may need to scroll right to find it
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Tap "Add" to confirm</p>
                    <p className="text-sm text-muted-foreground">
                      The Trustroom.ai icon will appear on your home screen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Install on Android
                </CardTitle>
                <CardDescription>
                  Follow these steps to add Trustroom.ai to your home screen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Tap the menu (⋮) in Chrome</p>
                    <p className="text-sm text-muted-foreground">
                      Look for three dots in the top-right corner
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Select "Install app" or "Add to Home screen"</p>
                    <p className="text-sm text-muted-foreground">
                      The option may vary depending on your browser
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Confirm the installation</p>
                    <p className="text-sm text-muted-foreground">
                      Trustroom.ai will be installed as an app
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          <div className="mt-8 grid gap-4">
            <h2 className="text-lg font-semibold">Why Install?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "Instant Access", desc: "Launch from home screen" },
                { title: "Works Offline", desc: "View cached deals & docs" },
                { title: "Faster Loading", desc: "Native-like performance" },
                { title: "Push Notifications", desc: "Stay updated on deals" },
              ].map((benefit) => (
                <Card key={benefit.title} className="bg-muted/30">
                  <CardContent className="p-4">
                    <h3 className="font-medium">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InstallPage;
