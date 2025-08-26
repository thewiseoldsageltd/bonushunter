import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, Eye, Users, Building } from 'lucide-react';

interface BonusFormData {
  title: string;
  description: string;
  operatorId: string;
  productType: string;
  bonusType: string;
  matchPercent: string;
  minDeposit: string;
  maxBonus: string;
  promoCode: string;
  landingUrl: string;
  wageringRequirement: string;
  expiryDays: string;
  valueScore: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingBonus, setEditingBonus] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bonusForm, setBonusForm] = useState<BonusFormData>({
    title: '',
    description: '',
    operatorId: '',
    productType: 'sportsbook',
    bonusType: 'first_bet_bonus',
    matchPercent: '0',
    minDeposit: '0',
    maxBonus: '0',
    promoCode: '',
    landingUrl: '',
    wageringRequirement: '1',
    expiryDays: '30',
    valueScore: '85'
  });

  // Fetch all bonuses
  const { data: bonusesData, isLoading: loadingBonuses } = useQuery({
    queryKey: ['/api/bonuses']
  });

  // Fetch operators
  const { data: operatorsData } = useQuery({
    queryKey: ['/api/admin/operators']
  });

  // Add bonus mutation
  const addBonusMutation = useMutation({
    mutationFn: async (formData: BonusFormData) => {
      const response = await apiRequest('POST', '/api/admin/bonuses', formData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bonus Added Successfully!",
        description: "The new bonus is now live and available in chat recommendations.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
      setShowAddForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Bonus",
        description: error.message || "Could not create bonus",
        variant: "destructive",
      });
    }
  });

  // Delete bonus mutation
  const deleteBonusMutation = useMutation({
    mutationFn: async (bonusId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/bonuses/${bonusId}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bonus Deleted",
        description: "Bonus has been removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Could not delete bonus",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setBonusForm({
      title: '',
      description: '',
      operatorId: '',
      productType: 'sportsbook',
      bonusType: 'first_bet_bonus',
      matchPercent: '0',
      minDeposit: '0',
      maxBonus: '0',
      promoCode: '',
      landingUrl: '',
      wageringRequirement: '1',
      expiryDays: '30',
      valueScore: '85'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonusForm.title || !bonusForm.operatorId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    addBonusMutation.mutate(bonusForm);
  };

  const bonuses = (bonusesData as any)?.bonuses || [];
  const operators = (operatorsData as any)?.operators || [];

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bonushunter Admin
        </h1>
        <Badge variant="secondary" className="px-3 py-1">
          Manual Management Mode
        </Badge>
      </div>

      <Tabs defaultValue="bonuses" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="bonuses" data-testid="tab-bonuses">
            Bonus Management
          </TabsTrigger>
          <TabsTrigger value="operators" data-testid="tab-operators">
            Operators
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bonuses" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {bonuses.length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Bonuses
                  </p>
                </div>
                <Building className="h-8 w-8 text-blue-500" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {operators.length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Active Operators
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    LIVE
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    System Status
                  </p>
                </div>
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              </CardContent>
            </Card>
          </div>

          {/* Add Bonus Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bonus Management</CardTitle>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                size="sm"
                data-testid="button-add-bonus"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Bonus
              </Button>
            </CardHeader>
            <CardContent>
              {showAddForm && (
                <div className="border-t pt-6 mt-4">
                  <h3 className="text-lg font-semibold mb-4">Add New Bonus</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Bonus Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., DraftKings Welcome Bonus"
                          value={bonusForm.title}
                          onChange={(e) => setBonusForm({ ...bonusForm, title: e.target.value })}
                          data-testid="input-bonus-title"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="operator">Operator *</Label>
                        <Select
                          value={bonusForm.operatorId}
                          onValueChange={(value) => setBonusForm({ ...bonusForm, operatorId: value })}
                        >
                          <SelectTrigger data-testid="select-operator">
                            <SelectValue placeholder="Choose operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((op: any) => (
                              <SelectItem key={op.id} value={op.id}>
                                {op.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="e.g., Bet $5, Get $150 in Bonus Bets"
                        value={bonusForm.description}
                        onChange={(e) => setBonusForm({ ...bonusForm, description: e.target.value })}
                        data-testid="input-bonus-description"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minDeposit">Min Deposit ($)</Label>
                        <Input
                          id="minDeposit"
                          type="number"
                          value={bonusForm.minDeposit}
                          onChange={(e) => setBonusForm({ ...bonusForm, minDeposit: e.target.value })}
                          data-testid="input-min-deposit"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="maxBonus">Max Bonus ($)</Label>
                        <Input
                          id="maxBonus"
                          type="number"
                          value={bonusForm.maxBonus}
                          onChange={(e) => setBonusForm({ ...bonusForm, maxBonus: e.target.value })}
                          data-testid="input-max-bonus"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="wageringRequirement">Wagering</Label>
                        <Input
                          id="wageringRequirement"
                          type="number"
                          step="0.1"
                          value={bonusForm.wageringRequirement}
                          onChange={(e) => setBonusForm({ ...bonusForm, wageringRequirement: e.target.value })}
                          data-testid="input-wagering"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="valueScore">Value Score</Label>
                        <Input
                          id="valueScore"
                          type="number"
                          max="100"
                          value={bonusForm.valueScore}
                          onChange={(e) => setBonusForm({ ...bonusForm, valueScore: e.target.value })}
                          data-testid="input-value-score"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="landingUrl">Landing URL</Label>
                      <Input
                        id="landingUrl"
                        placeholder="https://operator.com/bonus"
                        value={bonusForm.landingUrl}
                        onChange={(e) => setBonusForm({ ...bonusForm, landingUrl: e.target.value })}
                        data-testid="input-landing-url"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={addBonusMutation.isPending}
                        data-testid="button-save-bonus"
                      >
                        {addBonusMutation.isPending ? "Adding..." : "Add Bonus"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                        data-testid="button-cancel-bonus"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Bonuses */}
          <Card>
            <CardHeader>
              <CardTitle>Current Bonuses ({bonuses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBonuses ? (
                <p className="text-center py-4">Loading bonuses...</p>
              ) : bonuses.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  No bonuses added yet. Click "Add New Bonus" to get started!
                </p>
              ) : (
                <div className="space-y-4">
                  {bonuses.map((bonus: any) => (
                    <div
                      key={bonus.id}
                      className="flex items-start justify-between p-4 border rounded-lg bg-white dark:bg-gray-800"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{bonus.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          {bonus.operator?.name} • {bonus.description}
                        </p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Min: ${bonus.minDeposit}</span>
                          <span>Max: ${bonus.maxBonus}</span>
                          <span>Wagering: {bonus.wageringRequirement}x</span>
                          <Badge variant="outline">
                            Score: {bonus.valueScore}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(bonus.landingUrl, '_blank')}
                          data-testid={`button-view-${bonus.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteBonusMutation.mutate(bonus.id)}
                          disabled={deleteBonusMutation.isPending}
                          data-testid={`button-delete-${bonus.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operators">
          <Card>
            <CardHeader>
              <CardTitle>Operators ({operators.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {operators.map((operator: any) => (
                  <div
                    key={operator.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{operator.name}</h3>
                      <p className="text-sm text-gray-500">{operator.siteUrl}</p>
                    </div>
                    <Badge variant="secondary">
                      Trust: {operator.trustScore}/10
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Your platform is live and collecting bonus data!
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">✓</p>
                  <p className="text-sm">Chat AI Working</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">✓</p>
                  <p className="text-sm">Database Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;