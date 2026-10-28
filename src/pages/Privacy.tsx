import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Plain summary of how data is used. The legal text must be reviewed and
 * replaced by the organisation before launch (policy version in src/api/consents.ts).
 */
const Privacy = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Privacy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-gray-800">
        <section>
          <h2 className="font-semibold">What we keep</h2>
          <p>
            The details you give when you register, the complaints you file, and the files you upload as evidence. They are used to register and handle your
            complaints and are visible only to you and the police officers handling your case.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">AI help (optional)</h2>
          <p>
            If you agree, AI can suggest legal sections, answer questions about your case and help you describe an incident. AI output is general
            information and suggestions. A police officer always makes the decision. You can turn this off at any time and keep using the form.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">Your choices</h2>
          <p>
            You can change your consents and download a copy of your data from the Privacy section after signing in.{" "}
            <Link to="/login" className="underline text-blue-600">
              Sign in
            </Link>
          </p>
        </section>
      </CardContent>
    </Card>
  </div>
);

export default Privacy;
