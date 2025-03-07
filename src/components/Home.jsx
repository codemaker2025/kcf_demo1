// Home.jsx
import React from 'react';
import { useInstallments } from './useInstallments.js';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Table,
  InputGroup,
  Badge
} from 'react-bootstrap';

export default function Home() {
  const {
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
  } = useInstallments();

  const installmentOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Container className="py-4">
      <h1 className="mb-4">Installment Calculator</h1>
      
      <Form onSubmit={calculateInstallments}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Total Amount ($)</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  placeholder="Enter amount"
                />
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Number of Installments</Form.Label>
              <Form.Select
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
              >
                <option value="">Select</option>
                {installmentOptions.map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <Button variant="primary" type="submit" className="mb-3">
          Calculate
        </Button>
      </Form>

      {installmentData.length > 0 && (
        <div>
          <h2 className="mt-4 mb-3">Installment Schedule</h2>
          <div className="mb-3">
            <Button 
              variant="success"
              onClick={mergeSelectedInstallments}
              disabled={selectedInstallments.length < 2}
              className="me-2"
            >
              Merge Selected
            </Button>
            <Button 
              variant="warning"
              onClick={unmergeSelectedInstallment}
              disabled={selectedInstallments.length !== 1}
              className="me-2"
            >
              Unmerge Selected
            </Button>
            <Button 
              variant="info"
              onClick={splitSelectedInstallment}
              disabled={selectedInstallments.length !== 1}
              className="me-2"
            >
              Split Selected
            </Button>
            <Button 
              variant="secondary"
              onClick={unsplitSelectedInstallment}
              disabled={selectedInstallments.length !== 2}
            >
              Unsplit Selected
            </Button>
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Select</th>
                <th>Split</th>
                <th>Installment #</th>
                <th>Amount (₹)</th>
                <th>Due Date</th>
                <th>Merged From</th>
              </tr>
            </thead>
            <tbody>
              {installmentData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedInstallments.includes(item.id)}
                      onChange={() => handleSelection(item.id)}
                    />
                  </td>
                  <td>
                    {item.split ? (
                      <Badge bg="success">Yes</Badge>
                    ) : (
                      <Badge bg="secondary">No</Badge>
                    )}
                  </td>
                  <td>{item.id}</td>
                  <td>₹{item.amount}</td>
                  <td>
                    <Form.Control
                      type="date"
                      value={item.dueDate || ''}
                      onChange={(e) => handleDateChange(item.id, e.target.value)}
                      min={today}
                    />
                  </td>
                  <td>{item.mergedFrom || '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}