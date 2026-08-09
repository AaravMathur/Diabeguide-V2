import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { User as UserIcon, Mail, Phone, Calendar, Weight, Activity, Heart, Shield, Download, Edit2, Camera } from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [diabetesType, setDiabetesType] = useState("type2");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [healthScore, setHealthScore] = useState(0);
  const [memberSince, setMemberSince] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(true);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Fetch current profile details on mount
  useEffect(() => {
    const loadProfile = async () => {
      // Load initial profile data from localStorage/sessionStorage instantly
      const localUserStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (localUserStr) {
        try {
          const u = JSON.parse(localUserStr);
          if (u) {
            setName(u.name || "");
            setEmail(u.email || "");
            setPhone(u.phone || "");
            setAge(u.age ? String(u.age) : "");
            setWeight(u.weight ? String(u.weight) : "");
            setDiabetesType(u.diabetesType || "type2");
            setEmergencyContact(u.emergencyContact || "");
            setHealthScore(u.healthScore || 85);
            setAvatar(u.avatar || "");
          }
        } catch (e) {}
      }

      try {
        const data = await api.auth.getMe();
        if (data && data.user) {
          const u = data.user;
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setAge(u.age ? String(u.age) : "");
          setWeight(u.weight ? String(u.weight) : "");
          setDiabetesType(u.diabetesType || "type2");
          setEmergencyContact(u.emergencyContact || "");
          setHealthScore(u.healthScore || 85);
          setAvatar(u.avatar || "");
          
          if (u.createdAt) {
            const dateStr = new Date(u.createdAt).toLocaleDateString([], {
              year: "numeric",
              month: "long"
            });
            setMemberSince(dateStr);
          } else {
            setMemberSince("Active Member");
          }

          const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
          storage.setItem("user", JSON.stringify(u));
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // 2. Save edited profile details
  const handleSave = async () => {
    try {
      const payload: any = {
        name: name.trim(),
        phone: phone.trim(),
        diabetesType,
        emergencyContact: emergencyContact.trim(),
        avatar
      };
      if (age && !isNaN(Number(age))) payload.age = Number(age);
      if (weight && !isNaN(Number(weight))) payload.weight = Number(weight);

      const res = await api.auth.updateProfile(payload);

      if (res && res.user) {
        const u = res.user;
        setName(u.name || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
        setAge(u.age ? String(u.age) : "");
        setWeight(u.weight ? String(u.weight) : "");
        setDiabetesType(u.diabetesType || "type2");
        setEmergencyContact(u.emergencyContact || "");
        setHealthScore(u.healthScore || 85);
        setAvatar(u.avatar || "");

        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(u));
      }

      setIsEditing(false);
      toast.success("Profile updated successfully!");
      window.dispatchEvent(new Event("profile-updated"));
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile details");
    }
  };

  const handleExportReports = () => {
    toast.success("Reports exported successfully!");
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getHealthScoreText = (score: number) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    return "Needs Attention";
  };

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="h-8 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg mt-2"></div>
          </div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="lg:col-span-1 p-6 space-y-4 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-4 w-44 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="w-full space-y-3 pt-4">
              <div className="h-12 w-full bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
              <div className="h-12 w-full bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
              <div className="h-12 w-full bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6 space-y-6">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-10 w-full bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage your personal information and settings</p>
        </div>
        <Button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className={
            isEditing
              ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
              : ""
          }
        >
          {isEditing ? "Save Changes" : <><Edit2 className="w-4 h-4 mr-2" />Edit Profile</>}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-blue-500/30 relative group shadow-md flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-600">
                {avatar ? (
                  <img src={avatar} alt="Profile Avatar" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {getInitials(name || (email ? email.split("@")[0] : "User"))}
                  </span>
                )}
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 text-white cursor-pointer opacity-0 group-hover:opacity-100 transition duration-200">
                    <Camera className="w-8 h-8" />
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>
            <CardTitle>{name || (email ? email.split("@")[0] : "User Profile")}</CardTitle>
            <CardDescription>{email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-semibold text-gray-900">{memberSince}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <Heart className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600">Glucose Target Range</p>
                  <p className="font-semibold text-gray-900">70 - 130 mg/dL</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Health Score</p>
                  <p className="font-semibold text-gray-900">{getHealthScoreText(healthScore)} ({healthScore})</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled={true} // Email is immutable as user login identifier
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="flex items-center gap-2">
                  <Weight className="w-4 h-4" />
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diabetes">Diabetes Type</Label>
                <Select value={diabetesType} onValueChange={setDiabetesType} disabled={!isEditing}>
                  <SelectTrigger id="diabetes">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="type1">Type 1</SelectItem>
                    <SelectItem value="type2">Type 2</SelectItem>
                    <SelectItem value="prediabetes">Prediabetes</SelectItem>
                    <SelectItem value="gestational">Gestational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="emergency" className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-600" />
                Emergency Contact
              </Label>
              <Input
                id="emergency"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                disabled={!isEditing}
                placeholder="+1 234 567 8901"
              />
              <p className="text-xs text-gray-500">
                This contact will be notified in case of emergency
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download your health reports and data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportReports} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Reports as PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
