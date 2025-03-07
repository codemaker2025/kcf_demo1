import { useState } from 'react';
import toast from 'react-hot-toast'; // Import toast

export const useInstallments = () => {
  const [amount, setAmount] = useState('');
  const [installments, setInstallments] = useState('');
  const [installmentData, setInstallmentData] = useState([]);
  const [selectedInstallments, setSelectedInstallments] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  console.log(today, "today");

  const calculateInstallments = (e) => {
    e.preventDefault();
    
    const totalAmount = parseFloat(amount);
    const installmentCount = parseInt(installments);
    
    if (!totalAmount || !installmentCount || installmentCount <= 0) {
      toast.error('Please enter valid amount and number of installments');
      return;
    }

    const installmentAmount = totalAmount / installmentCount;
    const todayDate = new Date();
    const newInstallments = [];

    for (let i = 0; i < installmentCount; i++) {
      const dueDate = new Date(todayDate);
      dueDate.setMonth(todayDate.getMonth() + i);
      
      newInstallments.push({
        id: `${i + 1}`,
        amount: installmentAmount.toFixed(2),
        dueDate: dueDate.toISOString().split('T')[0],
        merged: false,
        mergedFrom: null,
        split: false,
        originalDates: null
      });
    }

    setInstallmentData(newInstallments);
    setSelectedInstallments([]);
    toast.success('Installments calculated successfully'); // Optional success message
  };
  console.log(installmentData, "installmentData");
  
  const handleSelection = (id) => {
    setSelectedInstallments(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleDateChange = (id, newDate) => {
    const newDateObj = new Date(newDate);
    const todayDate = new Date(today);
    
    const currentIndex = installmentData.findIndex(item => item.id === id);
    
    if (newDateObj < todayDate) {
      const diffMonths = (todayDate.getFullYear() - newDateObj.getFullYear()) * 12 + 
                        (todayDate.getMonth() - newDateObj.getMonth());
      
      if (diffMonths > 1) {
        toast.error('Cannot select a date more than one month in the past');
        return;
      }
    }
  
    if (currentIndex > 0) {
      const prevDate = new Date(installmentData[currentIndex - 1].dueDate);
      if (newDateObj <= prevDate) {
        toast.error('Date must be after previous installment');
        return;
      }
    }
  
    if (currentIndex < installmentData.length - 1) {
      const nextDate = new Date(installmentData[currentIndex + 1].dueDate);
      if (newDateObj >= nextDate) {
        toast.error('Date must be before next installment');
        return;
      }
    }
  
    setInstallmentData(prev => prev.map(item => 
      item.id === id ? { ...item, dueDate: newDate } : item
    ));
    toast.success('Date updated successfully'); // Optional success message
  };

  const mergeSelectedInstallments = () => {
    if (selectedInstallments.length < 2) {
      toast.error('Please select at least 2 installments to merge');
      return;
    }
    
    const newInstallments = [...installmentData];
    const selectedIndices = selectedInstallments
      .map(id => newInstallments.findIndex(item => item.id === id))
      .sort((a, b) => a - b);
    console.log(selectedIndices, "selectedIndices");
    
    const selectedItems = selectedIndices.map(index => newInstallments[index]);
    console.log(selectedItems, "selectedItems");
    
    if (selectedItems.some(item => item.merged)) {
      toast.error('Cannot merge already merged installments');
      return;
    }
    
    if (selectedItems.some(item => item.split)) {
      toast.error('Cannot merge installments that have been split');
      return;
    }
    
    const totalAmount = selectedIndices.reduce((sum, index) => 
      sum + parseFloat(newInstallments[index].amount), 0);
    const dates = selectedIndices.map(index => new Date(newInstallments[index].dueDate));
    const earliestDate = new Date(Math.min(...dates));
    const earliestDateStr = earliestDate.toISOString().split('T')[0];
  
    if (selectedIndices[0] > 0) {
      const prevDate = new Date(newInstallments[selectedIndices[0] - 1].dueDate);
      if (earliestDate <= prevDate) {
        toast.error('Merged date must be after previous installment');
        return;
      }
    }
    if (selectedIndices[selectedIndices.length - 1] < newInstallments.length - 1) {
      const nextDate = new Date(newInstallments[selectedIndices[selectedIndices.length - 1] + 1].dueDate);
      if (earliestDate >= nextDate) {
        toast.error('Merged date must be before next installment');
        return;
      }
    }
    
    const mergedIds = selectedInstallments.join('+');
    const originalDates = selectedInstallments.map(id => {
      const item = newInstallments.find(item => item.id === id);
      return { id, date: item.dueDate };
    });
  
    const firstIndex = selectedIndices[0];
    newInstallments[firstIndex] = {
      ...newInstallments[firstIndex],
      amount: totalAmount.toFixed(2),
      dueDate: earliestDateStr,
      merged: true,
      mergedFrom: mergedIds,
      originalDates: originalDates
    };
  
    for (let i = selectedIndices.length - 1; i > 0; i--) {
      newInstallments.splice(selectedIndices[i], 1);
    }
  
    setInstallmentData(newInstallments);
    setSelectedInstallments([]);
    toast.success('Installments merged successfully');
  };

  const unmergeSelectedInstallment = () => {
    if (selectedInstallments.length !== 1) {
      toast.error('Please select exactly 1 merged installment to unmerge');
      return;
    }
    
    const newInstallments = [...installmentData];
    const index = newInstallments.findIndex(item => item.id === selectedInstallments[0]);

    if (!newInstallments[index].merged || !newInstallments[index].mergedFrom) {
      toast.error('Please select a merged installment to unmerge');
      return;
    }

    const originalIds = newInstallments[index].mergedFrom.split('+');
    const totalAmount = parseFloat(newInstallments[index].amount);
    const splitAmount = (totalAmount / originalIds.length).toFixed(2);
    const originalDates = newInstallments[index].originalDates;

    for (let i = 0; i < originalDates.length - 1; i++) {
      if (new Date(originalDates[i + 1].date) <= new Date(originalDates[i].date)) {
        toast.error('Unmerged dates must be sequential');
        return;
      }
    }

    if (index > 0) {
      const prevDate = new Date(newInstallments[index - 1].dueDate);
      if (new Date(originalDates[0].date) <= prevDate) {
        toast.error('First unmerged date must be after previous installment');
        return;
      }
    }
    if (index < newInstallments.length - 1) {
      const nextDate = new Date(newInstallments[index + 1].dueDate);
      if (new Date(originalDates[originalDates.length - 1].date) >= nextDate) {
        toast.error('Last unmerged date must be before next installment');
        return;
      }
    }

    newInstallments.splice(index, 1);

    originalIds.forEach((id, i) => {
      const originalDate = originalDates.find(item => item.id === id).date;
      newInstallments.splice(index + i, 0, {
        id: id,
        amount: splitAmount,
        dueDate: originalDate,
        merged: false,
        mergedFrom: null,
        split: false,
        originalDates: null
      });
    });

    setInstallmentData(newInstallments);
    setSelectedInstallments([]);
    toast.success('Installment unmerged successfully');
  };

  const splitSelectedInstallment = () => {
    if (selectedInstallments.length !== 1) {
      toast.error('Please select exactly 1 installment to split');
      return;
    }
    
    const newInstallments = [...installmentData];
    const index = newInstallments.findIndex(item => item.id === selectedInstallments[0]);
    const selected = newInstallments[index];
  
    if (selected.merged) {
      toast.error('Cannot split a merged installment');
      return;
    }
  
    if (selected.split) {
      toast.error('Cannot split an installment that is already split');
      return;
    }
  
    const originalAmount = parseFloat(selected.amount);
    const splitAmount = (originalAmount / 2).toFixed(2);
    const baseDueDate = new Date(selected.dueDate);
    
    const firstDueDate = baseDueDate;
    const secondDueDate = new Date(baseDueDate);
    secondDueDate.setDate(baseDueDate.getDate() + 1);
    
    const lastDayOfMonth = new Date(baseDueDate.getFullYear(), baseDueDate.getMonth() + 1, 0).getDate();
    if (secondDueDate.getDate() > lastDayOfMonth) {
      secondDueDate.setDate(lastDayOfMonth);
    }

    if (index > 0) {
      const prevDate = new Date(newInstallments[index - 1].dueDate);
      if (firstDueDate <= prevDate) {
        toast.error('First split date must be after previous installment');
        return;
      }
    }
    if (index < newInstallments.length - 1) {
      const nextDate = new Date(newInstallments[index + 1].dueDate);
      if (secondDueDate >= nextDate) {
        toast.error('Second split date must be before next installment');
        return;
      }
    }
  
    const parentNumber = selected.id.split('.')[0];
    const firstPart = {
      id: `${parentNumber}.1`,
      amount: splitAmount,
      dueDate: firstDueDate.toISOString().split('T')[0],
      merged: false,
      mergedFrom: null,
      split: true,
      originalDates: null
    };
  
    const secondPart = {
      id: `${parentNumber}.2`,
      amount: splitAmount,
      dueDate: secondDueDate.toISOString().split('T')[0],
      merged: false,
      mergedFrom: null,
      split: true,
      originalDates: null
    };
  
    newInstallments.splice(index, 1, firstPart, secondPart);
    setInstallmentData(newInstallments);
    setSelectedInstallments([]);
    toast.success('Installment split successfully');
  };

  const unsplitSelectedInstallment = () => {
    if (selectedInstallments.length !== 2) {
      toast.error('Please select exactly 2 split installments to unsplit');
      return;
    }
    
    const newInstallments = [...installmentData];
    const selectedIndices = selectedInstallments
      .map(id => newInstallments.findIndex(item => item.id === id))
      .sort((a, b) => a - b);

    const firstItem = newInstallments[selectedIndices[0]];
    const secondItem = newInstallments[selectedIndices[1]];

    const firstParent = firstItem.id.split('.')[0];
    const secondParent = secondItem.id.split('.')[0];
    
    if (firstParent !== secondParent || 
        !firstItem.split || 
        !secondItem.split || 
        firstItem.id.split('.')[1] !== '1' || 
        secondItem.id.split('.')[1] !== '2') {
      toast.error('Please select two consecutive split installments (e.g., 1.1 and 1.2)');
      return;
    }

    if (selectedIndices[1] !== selectedIndices[0] + 1) {
      toast.error('Split installments must be consecutive');
      return;
    }

    const combinedAmount = (parseFloat(firstItem.amount) + parseFloat(secondItem.amount)).toFixed(2);
    const originalDate = firstItem.dueDate;

    if (selectedIndices[0] > 0) {
      const prevDate = new Date(newInstallments[selectedIndices[0] - 1].dueDate);
      if (new Date(originalDate) <= prevDate) {
        toast.error('Unsplit date must be after previous installment');
        return;
      }
    }
    if (selectedIndices[1] < newInstallments.length - 1) {
      const nextDate = new Date(newInstallments[selectedIndices[1] + 1].dueDate);
      if (new Date(originalDate) >= nextDate) {
        toast.error('Unsplit date must be before next installment');
        return;
      }
    }

    const unsplitInstallment = {
      id: firstParent,
      amount: combinedAmount,
      dueDate: originalDate,
      merged: false,
      mergedFrom: null,
      split: false,
      originalDates: null
    };

    newInstallments.splice(selectedIndices[0], 2, unsplitInstallment);
    
    setInstallmentData(newInstallments);
    setSelectedInstallments([]);
    toast.success('Installments unsplit successfully');
  };

  return {
    amount,
    setAmount,
    installments,
    setInstallments,
    installmentData,
    selectedInstallments,
    today,
    calculateInstallments,
    handleSelection,
    handleDateChange,
    mergeSelectedInstallments,
    unmergeSelectedInstallment,
    splitSelectedInstallment,
    unsplitSelectedInstallment
  };
};