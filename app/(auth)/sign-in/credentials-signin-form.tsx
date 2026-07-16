'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CredentialsSignInForm = () => {
    return (
        <form>
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                    />
                </div>
            </div>
        </form>
    );
};

export default CredentialsSignInForm;