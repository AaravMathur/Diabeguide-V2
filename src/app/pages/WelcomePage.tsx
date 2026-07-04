import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Heart, ArrowRight } from "lucide-react";
import { api } from "../services/api";
import { toast } from "sonner";

export function WelcomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Profile field states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [diabetesType, setDiabetesType] = useState("type2");
  const [emergencyContact, setEmergencyContact] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {};
      if (name) payload.name = name;
      if (phone) payload.phone = phone;
      if (age) payload.age = Number(age);
      if (weight) payload.weight = Number(weight);
      if (diabetesType) payload.diabetesType = diabetesType;
      if (emergencyContact) payload.emergencyContact = emergencyContact;

      await api.auth.updateProfile(payload);
      toast.success("Profile initialized successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAyIiBoZWlnaHQ9IjYwMiIgdmlld0JveD0iMCAwIDYwIDYwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02IiBzdHJva2U9IiM5M2M1ZmQiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-40"></div>

      <Card className="w-full max-w-lg relative backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 shadow-2xl border-blue-100 dark:border-slate-800">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center animate-pulse">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Welcome to DiabeGuide!
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-2 text-base">
              Let's customize your profile. These details help our clinical AI advisor give you highly accurate suggestions and personalized alerts.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-gray-700 dark:text-gray-300">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="45"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight" className="text-gray-700 dark:text-gray-300">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="75"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="diabetesType" className="text-gray-700 dark:text-gray-300">Diabetes Type</Label>
                <Select value={diabetesType} onValueChange={setDiabetesType}>
                  <SelectTrigger id="diabetesType" className="bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700">
                    <SelectValue placeholder="Select diabetes classification" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <SelectItem value="type1">Type 1 Diabetes</SelectItem>
                    <SelectItem value="type2">Type 2 Diabetes</SelectItem>
                    <SelectItem value="gestational">Gestational Diabetes</SelectItem>
                    <SelectItem value="prediabetes">Prediabetes</SelectItem>
                    <SelectItem value="none">None / Healthy Tracker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="emergencyContact" className="text-gray-700 dark:text-gray-300">Emergency Contact Number</Label>
                <Input
                  id="emergencyContact"
                  placeholder="+1 234 567 8901"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700"
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white flex items-center justify-center gap-2 cursor-pointer py-6 text-base font-semibold"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving Details...
                  </>
                ) : (
                  <>
                    Get Started <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  toast.success("You can complete your profile settings at any time!");
                  navigate("/dashboard");
                }}
                className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white cursor-pointer"
              >
                Skip for now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
